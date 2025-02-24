/// <reference path="../../../workers-config.d.ts" />
/// <reference types="@cloudflare/workers-types" />

import type {
	UseChatMessageRequest,
	UseChatMessageResponse,
	WsIncomingMessage,
} from "@/types/chat";
import { DurableObject } from "cloudflare:workers";
import type { Message } from "ai";
import { streamText } from "ai";
import { groq } from "@ai-sdk/groq";

export class AgentDurableObject extends DurableObject<Env> {
	/* constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
	} */

	async fetch(_request: Request): Promise<Response> {
		const webSocketPair = new WebSocketPair();
		const [client, server] = Object.values(webSocketPair);

		this.ctx.acceptWebSocket(server);

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	async webSocketMessage(ws: WebSocket, message: string) {
		// Handle different message types
		try {
			const data = JSON.parse(message) as WsIncomingMessage;

			// Process chat requests
			if (data.type === "use_chat_request") {
				await this.handleChatRequest(ws, data);
			}
		} catch (error) {
			console.error("Error handling WebSocket message:", error);
		}
	}

	private async handleChatRequest(
		ws: WebSocket,
		{ id, init }: UseChatMessageRequest,
	) {
		const {
			method,
			// keepalive,
			// headers,
			body,
			// redirect,
			// integrity,
			// credentials,
			// mode,
			// referrer,
			// referrerPolicy,
			// window,
			// dispatcher,
			// duplex
		} = init;

		const requestBody = JSON.parse(body as string);
		const messages: Message[] = requestBody.messages;

		console.log("request", {
			id,
			init,
		});

		console.log("connections", this.ctx.getWebSockets().length);

		if (method !== "POST") {
			return;
		}

		const result = streamText({
			model: groq("llama3-70b-8192"),
			system: "You are a helpful assistant.",
			messages,
		});

		for await (const chunk of result) {
			const body = "";
			const newChatResponse: UseChatMessageResponse = {
				type: "use_chat_response",
				id,
				body,
				done: false,
			};
			ws.send(JSON.stringify(newChatResponse));
		}

		const finalChatResponse: UseChatMessageResponse = {
			type: "use_chat_response",
			id,
			body: "",
			done: true,
		};
		ws.send(JSON.stringify(finalChatResponse));
	}

	async webSocketClose(ws: WebSocket, code: number, reason: string) {
		// Remove the connection from our set
		console.log(`WebSocket closed with code ${code}, reason: ${reason}`);
		ws.close(code, reason);
	}
}

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
import { createGroq } from "@ai-sdk/groq";
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
		const { method, body } = init;
		const requestBody = JSON.parse(body as string);
		const messages: Message[] = requestBody.messages;

		if (method !== "POST") {
			return;
		}

		try {
			const groqClient = createGroq({
				baseURL: this.env.AI_GATEWAY_GROQ_URL,
				apiKey: this.env.GROQ_API_KEY,
			});

			const result = streamText({
				model: groqClient("llama3-70b-8192"),
				system: "You are a helpful assistant.",
				messages,
			});

			// Handle the stream correctly according to Data Stream Protocol
			for await (const part of result.fullStream) {
				let eventString: string;

				switch (part.type) {
					case "text-delta":
						// Properly JSON stringify the text delta
						eventString = `0:${JSON.stringify(part.textDelta)}\n`;
						break;
					case "finish": {
						// Send the finish step part
						eventString = `e:${JSON.stringify({
							finishReason: part.finishReason,
							usage: {
								promptTokens: part.usage.promptTokens,
								completionTokens: part.usage.completionTokens,
							},
							isContinued: false,
						})}\n`;

						// Also send the finish message part
						const finalMessage: UseChatMessageResponse = {
							type: "use_chat_response",
							id,
							body: `d:${JSON.stringify({
								finishReason: part.finishReason,
								usage: {
									promptTokens: part.usage.promptTokens,
									completionTokens: part.usage.completionTokens,
								},
							})}\n`,
							done: true,
						};
						ws.send(JSON.stringify(finalMessage));
						break;
					}
					default:
						continue;
				}

				const response: UseChatMessageResponse = {
					type: "use_chat_response",
					id,
					body: eventString,
					done: part.type === "finish",
				};
				ws.send(JSON.stringify(response));
			}
		} catch (error) {
			console.error("Error handling chat request:", error);

			// Send an error event
			const errorResponse: UseChatMessageResponse = {
				type: "use_chat_response",
				id,
				body: `3:${JSON.stringify("Failed to process request")}\n`,
				done: true,
			};
			ws.send(JSON.stringify(errorResponse));
		}
	}

	async webSocketClose(ws: WebSocket, code: number, reason: string) {
		// Remove the connection from our set
		console.log(`WebSocket closed with code ${code}, reason: ${reason}`);
		ws.close(code, reason);
	}
}

/// <reference path="../../../workers-config.d.ts" />
/// <reference types="@cloudflare/workers-types" />

import { DurableObject } from "cloudflare:workers";

import {
	drizzle,
	type DrizzleSqliteDODatabase,
} from "drizzle-orm/durable-sqlite";
import { migrate } from "drizzle-orm/durable-sqlite/migrator";
// @ts-ignore
import migrations from "./db/migrations/migrations";
import type { ChatMessage, WsChatRoomMessage } from "@/types/chat";
import { generateText, type Message } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { nanoid } from "nanoid";
export class AgentDurableObject extends DurableObject<Env> {
	storage: DurableObjectStorage;
	db: DrizzleSqliteDODatabase;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.storage = ctx.storage;
		this.db = drizzle(this.storage, { logger: false });
	}

	async migrate() {
		migrate(this.db, migrations);
	}

	async fetch(_request: Request): Promise<Response> {
		const webSocketPair = new WebSocketPair();
		const [client, server] = Object.values(webSocketPair);

		this.ctx.acceptWebSocket(server);

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	async webSocketMessage(webSocket: WebSocket, message: string) {
		try {
			const parsedMsg: WsChatRoomMessage = JSON.parse(message);

			if (parsedMsg.type === "message-receive") {
				console.log("message-receive", parsedMsg);
				const messages: Omit<Message, "id">[] = [];
				const newMessage: Omit<Message, "id"> = {
					role: "user",
					content: parsedMsg.message.content,
					createdAt: new Date(parsedMsg.message.createdAt),
				};
				const aiResponse = await this.generateAiResponse([
					...messages,
					newMessage,
				]);
				console.log("aiResponse", aiResponse);
				const newChatMessage: ChatMessage = {
					id: nanoid(),
					role: "assistant",
					content: aiResponse,
					createdAt: newMessage.createdAt?.getTime() ?? Date.now(),
				};

				const wsMessage: WsChatRoomMessage = {
					type: "message-broadcast",
					message: newChatMessage,
				};

				await webSocket.send(JSON.stringify(wsMessage));
			}
		} catch (err) {
			if (err instanceof Error) {
				webSocket.send(JSON.stringify({ error: err.message }));
			}
		}
	}

	async webSocketClose(
		ws: WebSocket,
		code: number,
		_reason: string,
		_wasClean: boolean,
	) {
		ws.close(code, "Durable Object is closing WebSocket");
	}

	private async generateAiResponse(messages: Omit<Message, "id">[]) {
		const groqClient = createGroq({
			baseURL: this.env.AI_GATEWAY_GROQ_URL,
			apiKey: this.env.GROQ_API_KEY,
		});

		const result = await generateText({
			model: groqClient("llama-3.3-70b-versatile"),
			system: "You are a helpful assistant",
			messages,
		});

		return result.text;
	}
}

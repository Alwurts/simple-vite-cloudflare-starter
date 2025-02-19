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
import type {
	ChatMessage,
	ChatMessageAI,
	WsChatRoomMessage,
} from "@/types/chat";
import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { nanoid } from "nanoid";
import { chatMessagesTable } from "./db/schema";
import { desc } from "drizzle-orm";

type Session = {
	userId: string;
};

export class AgentDurableObject extends DurableObject<Env> {
	storage: DurableObjectStorage;
	db: DrizzleSqliteDODatabase;
	sessions: Set<WebSocket>;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.storage = ctx.storage;
		this.db = drizzle(this.storage, { logger: false });

		this.sessions = new Set();

		// Restore any existing WebSocket sessions
		for (const webSocket of ctx.getWebSockets()) {
			this.sessions.add(webSocket);
		}
	}

	async migrate() {
		migrate(this.db, migrations);
	}

	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);
		const userId = url.searchParams.get("userId");

		if (!userId) {
			return new Response("Missing user ID", { status: 400 });
		}

		const webSocketPair = new WebSocketPair();
		const [client, server] = Object.values(webSocketPair);

		this.ctx.acceptWebSocket(server);

		const session: Session = {
			userId,
		};
		server.serializeAttachment(session);
		this.sessions.add(server);

		const messages = await this.getChatMessages();

		this.broadcastWebSocketMessage({
			type: "messages-sync",
			messages,
		});

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	private broadcastWebSocketMessage(message: WsChatRoomMessage) {
		for (const ws of this.sessions) {
			ws.send(JSON.stringify(message));
		}
	}

	async webSocketMessage(webSocket: WebSocket, message: string) {
		try {
			const parsedMsg: WsChatRoomMessage = JSON.parse(message);

			if (parsedMsg.type === "message-receive") {
				console.log("message-receive", parsedMsg);

				const newUserMessage = await this.createChatMessage({
					id: nanoid(),
					role: "user",
					content: parsedMsg.message.content,
					createdAt: parsedMsg.message.createdAt,
				});

				const messageHistory = await this.getChatMessages(10);
				const messages: ChatMessageAI[] = messageHistory.map((message) => ({
					role: message.role,
					content: message.content,
					createdAt: new Date(message.createdAt),
				}));

				const aiResponse = await this.generateAiResponse([
					...messages,
					{
						role: "user",
						content: newUserMessage.content,
						createdAt: new Date(newUserMessage.createdAt),
					},
				]);

				const newAssistantMessage = await this.createChatMessage({
					id: nanoid(),
					role: "assistant",
					content: aiResponse,
					createdAt: new Date().getTime(),
				});

				this.broadcastWebSocketMessage({
					type: "message-broadcast",
					message: newAssistantMessage,
				});
			}
		} catch (err) {
			if (err instanceof Error) {
				webSocket.send(JSON.stringify({ error: err.message }));
			}
		}
	}

	async webSocketClose(webSocket: WebSocket) {
		this.sessions.delete(webSocket);
		webSocket.close();
	}

	async webSocketError(webSocket: WebSocket) {
		this.sessions.delete(webSocket);
		webSocket.close();
	}

	private async generateAiResponse(messages: ChatMessageAI[]) {
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

	async createChatMessage(message: ChatMessage) {
		const [newMessage] = await this.db
			.insert(chatMessagesTable)
			.values(message)
			.returning();
		return newMessage;
	}

	async getChatMessages(limit?: number) {
		const query = this.db
			.select()
			.from(chatMessagesTable)
			.orderBy(desc(chatMessagesTable.createdAt));
		if (limit) {
			query.limit(limit);
		}
		const messages = await query;
		return messages.reverse();
	}
}

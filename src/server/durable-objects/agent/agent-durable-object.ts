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
import type { WsChatRoomMessage } from "@/types/chat";

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
}

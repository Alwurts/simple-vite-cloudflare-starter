/// <reference path="../../../workers-config.d.ts" />
/// <reference types="@cloudflare/workers-types" />

import { DurableObject } from "cloudflare:workers";

export class AgentDurableObject extends DurableObject<Env> {
	/* constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
	} */
	async fetch(_request: Request): Promise<Response> {
		const webSocketPair = new WebSocketPair();
		const [client, server] = Object.values(webSocketPair);

		this.ctx.acceptWebSocket(server);

		//client.send(JSON.stringify({ type: "pingY" }));

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	async webSocketMessage(ws: WebSocket, message: ArrayBuffer | string) {
		// Upon receiving a message from the client, the server replies with the same message,
		// and the total number of connections with the "[Durable Object]: " prefix
		ws.send(
			`[Durable Object] message: ${message}, connections: ${this.ctx.getWebSockets().length}`,
		);
	}

	async webSocketClose(ws: WebSocket, code: number) {
		// If the client closes the connection, the runtime will invoke the webSocketClose() handler.
		ws.close(code, "Durable Object is closing WebSocket");
	}
}

import { Hono } from "hono";
import type { HonoVariables } from "@/types/hono";

const app = new Hono<HonoVariables>().get("/chat", async (c) => {
	const upgradeHeader = c.req.header("Upgrade");
	if (!upgradeHeader || upgradeHeader !== "websocket") {
		return c.text("Expected Upgrade: websocket", 426);
	}

	// Proceed with WebSocket connection
	const id = c.env.AGENT_DURABLE_OBJECT.idFromName("agent");
	const agent = c.env.AGENT_DURABLE_OBJECT.get(id);

	await agent.migrate();

	const url = new URL(c.req.url);
	url.searchParams.set("userId", "123");

	return await agent.fetch(new Request(url, c.req.raw));
});

export default app;

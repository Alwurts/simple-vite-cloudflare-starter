import { Hono } from "hono";
import agents from "./routes/agents";

interface Env {
	ASSETS: Fetcher;
}

const app = new Hono<{ Bindings: Env }>();

const routes = app.route("/agents", agents).all("*", async (c) => {
	return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
export type AppType = typeof routes;

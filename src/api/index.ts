import { Hono } from "hono";
import agents from "./routes/agents";
import type { HonoVariables } from "@/types/hono";
import { honoDbMiddleware } from "@/lib/hono/middleware";

const app = new Hono<HonoVariables>().use(honoDbMiddleware);

const routes = app.route("/agents", agents).all("*", async (c) => {
	return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
export type AppType = typeof routes;

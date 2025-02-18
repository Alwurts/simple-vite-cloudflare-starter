import { Hono } from "hono";
import agents from "./routes/agents";
import type { HonoVariables } from "@/types/hono";

const app = new Hono<HonoVariables>();

const routes = app.route("/agents", agents).all("*", async (c) => {
	return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
export type AppType = typeof routes;

import { drizzle } from "drizzle-orm/d1";
import type { Context, Next } from "hono";
import * as schema from "@/server/db/schema";

export const honoDbMiddleware = async (c: Context, next: Next) => {
	const db = drizzle(c.env.DB, { schema });
	c.set("db", db);
	await next();
};

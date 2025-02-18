import { Hono } from "hono";
import { z } from "zod";

import { zValidator } from "@hono/zod-validator";
import type { HonoVariables } from "@/types/hono";
import { usersTable } from "@/server/db/schema";
const app = new Hono<HonoVariables>().post(
	"/create",
	zValidator(
		"json",
		z.object({
			name: z.string().min(1),
		}),
	),
	async (c) => {
		const { name } = await c.req.valid("json");
		const db = c.get("db");
		const [result] = await db
			.insert(usersTable)
			.values({ name, age: 20, email: `test${name + Math.random()}@test.com` })
			.returning();

		if (!result) {
			throw new Error("Failed to create user");
		}

		console.log("result", result);

		return c.json(result);
	},
);

export default app;

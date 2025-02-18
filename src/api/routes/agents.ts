import { Hono } from "hono";
import { z } from "zod";

import { zValidator } from "@hono/zod-validator";
import type { HonoVariables } from "@/types/hono";

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

		return c.json({ agentName: name });
	},
);

export default app;

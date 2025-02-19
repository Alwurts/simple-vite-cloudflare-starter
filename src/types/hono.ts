/// <reference path="../workers-config.d.ts" />

import type { DrizzleD1Database } from "drizzle-orm/d1";
import type * as schema from "@/server/db/schema";

export type HonoVariables = {
	Bindings: Env;
	Variables: {
		db: DrizzleD1Database<typeof schema>;
	};
};

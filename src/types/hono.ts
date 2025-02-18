import type { DrizzleD1Database } from "drizzle-orm/d1";
import type * as schema from "@/server/db/schema";
import type { Env } from "./worker-configurations";

export type HonoVariables = {
	Bindings: Env;
	Variables: {
		db: DrizzleD1Database<typeof schema>;
	};
};

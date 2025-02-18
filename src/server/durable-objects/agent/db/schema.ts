import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const agentConfigTable = sqliteTable("agent_config", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	systemPrompt: text("system_prompt").notNull(),
	createdAt: integer("created_at", { mode: "number" })
		.notNull()
		.default(sql`(unixepoch() * 1000)`),
});

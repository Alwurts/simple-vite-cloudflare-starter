import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const chatMessagesTable = sqliteTable("chat_messages", {
	id: text("id").primaryKey(),
	role: text("role", { enum: ["user", "assistant"] }).notNull(),
	content: text("content").notNull(),
	createdAt: integer("created_at", { mode: "number" })
		.notNull()
		.default(sql`(unixepoch() * 1000)`),
});

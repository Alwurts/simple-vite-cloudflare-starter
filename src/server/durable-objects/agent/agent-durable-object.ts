/// <reference path="../../../workers-config.d.ts" />
/// <reference types="@cloudflare/workers-types" />

import { DurableObject } from "cloudflare:workers";

import {
	drizzle,
	type DrizzleSqliteDODatabase,
} from "drizzle-orm/durable-sqlite";
import { migrate } from "drizzle-orm/durable-sqlite/migrator";
// @ts-ignore
import migrations from "./db/migrations/migrations";
import { agentConfigTable } from "./db/schema";
import { eq } from "drizzle-orm";

export class AgentDurableObject extends DurableObject<Env> {
	storage: DurableObjectStorage;
	db: DrizzleSqliteDODatabase;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.storage = ctx.storage;
		this.db = drizzle(this.storage, { logger: false });
	}

	async migrate() {
		migrate(this.db, migrations);
	}

	/* private async generateAiResponse(messages: CoreMessage[]) {
		const agentConfig = await this.getAgentConfig();

		const groqClient = createGroq({
			baseURL: this.env.AI_GATEWAY_GROQ_URL,
			apiKey: this.env.GROQ_API_KEY,
		});

		const result = await generateText({
			model: groqClient("llama-3.3-70b-versatile"),
			system: getAgentPrompt({
				agentConfig,
			}),
			messages,
		});

		return result.text;
	} */

	async upsertAgentConfig(agentConfig: typeof agentConfigTable.$inferInsert) {
		await this.db
			.insert(agentConfigTable)
			.values(agentConfig)
			.onConflictDoUpdate({
				target: [agentConfigTable.id],
				set: agentConfig,
			});
	}

	async getAgentConfig(id: string) {
		const result = await this.db
			.select()
			.from(agentConfigTable)
			.where(eq(agentConfigTable.id, id));
		return result[0];
	}
}

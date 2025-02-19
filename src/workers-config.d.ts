import type { AgentDurableObject } from "./api/index";

declare global {
	interface Env {
		AI_GATEWAY_OPENAI_URL: string;
		AI_GATEWAY_GROQ_URL: string;
		OPENAI_API_KEY: string;
		GROQ_API_KEY: string;
		ASSETS: Fetcher;
		DB: D1Database;
		AGENT_DURABLE_OBJECT: DurableObjectNamespace<AgentDurableObject>; // Use the imported type
	}
}

declare module "*.sql" {
	const content: string;
	export default content;
}

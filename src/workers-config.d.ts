import type { AgentDurableObject } from "./api/index";

declare global {
	interface Env {
		ASSETS: Fetcher;
		DB: D1Database;
		AGENT_DURABLE_OBJECT: DurableObjectNamespace<AgentDurableObject>; // Use the imported type
	}
}

declare module "*.sql" {
	const content: string;
	export default content;
}

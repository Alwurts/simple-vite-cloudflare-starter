export interface Env {
	ASSETS: Fetcher;
	DB: D1Database;
	AGENT_DURABLE_OBJECT: DurableObjectNamespace<
		import("../api/index").AgentDurableObject
	>;
}

export type UseChatMessageResponse = {
	type: "use_chat_response";
	id: string;
	done: boolean;
	body: string;
};

export type UseChatMessageRequest = {
	type: "use_chat_request";
	id: string;
	init: Pick<
		RequestInit,
		| "method"
		| "keepalive"
		| "headers"
		| "body"
		| "redirect"
		| "integrity"
		| "credentials"
		| "mode"
		| "referrer"
		| "referrerPolicy"
		| "window"
	>;
};

export type WsOutgoingMessage = UseChatMessageResponse;

export type WsIncomingMessage = UseChatMessageRequest;

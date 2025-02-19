import type { CoreMessage } from "ai";

export type ChatMessage = {
	id: string;
	role: CoreMessage["role"];
	content: string;
	createdAt: number;
};

export type WsChatRoomMessage =
	| { type: "message-receive"; message: ChatMessage }
	| { type: "message-broadcast"; message: ChatMessage }
	| { type: "messages-sync"; messages: ChatMessage[] };

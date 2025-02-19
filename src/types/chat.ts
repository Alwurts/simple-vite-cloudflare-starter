import type { Message } from "ai";

export type ChatMessage = Omit<Message, "createdAt"> & {
	createdAt: number;
};

export type WsChatRoomMessage =
	| { type: "message-receive"; message: ChatMessage }
	| { type: "message-broadcast"; message: ChatMessage }
	| { type: "messages-sync"; messages: ChatMessage[] };

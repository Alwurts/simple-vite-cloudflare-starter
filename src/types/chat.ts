export type ChatMessage = {
	id: string;
	role: "assistant" | "user";
	content: string;
	createdAt: number;
};

export type ChatMessageAI = Omit<ChatMessage, "id" | "createdAt"> & {
	createdAt: Date;
};

export type WsChatRoomMessage =
	| { type: "message-receive"; message: ChatMessage }
	| { type: "message-broadcast"; message: ChatMessage }
	| { type: "messages-sync"; messages: ChatMessage[] };

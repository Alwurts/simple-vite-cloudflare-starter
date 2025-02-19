"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useChatWS } from "@/hooks/use-chat-ws";

const ChatWsContext = createContext<ReturnType<typeof useChatWS> | null>(null);

interface ChatProviderProps {
	children: ReactNode;
}

export function ChatWsProvider({ children }: ChatProviderProps) {
	const chat = useChatWS();

	return (
		<ChatWsContext.Provider value={chat}>{children}</ChatWsContext.Provider>
	);
}

export function useChatWsContext() {
	const context = useContext(ChatWsContext);
	if (!context) {
		throw new Error("useChatWsContext must be used within a ChatWsProvider");
	}
	return context;
}

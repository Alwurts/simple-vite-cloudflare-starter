"use client";

import { ChatWsProvider } from "@/components/chat/chat-ws-provider";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatContent } from "./chat-content";

export function Chat() {
	return (
		<ChatWsProvider>
			<ChatHeader />
			<ChatContent />
		</ChatWsProvider>
	);
}

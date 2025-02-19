"use client";

import { ChatWsProvider } from "@/components/chat/chat-ws-provider";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatContent } from "./chat-content";

export function Chat() {
	/* const queryParams = useSearchParams();
	const roomId = queryParams.get("roomId");

	if (!roomId) {
		return <ChatPlaceholderNoRoomSelected />;
	} */

	return (
		<ChatWsProvider roomId={""}>
			<ChatHeader />
			<ChatContent />
		</ChatWsProvider>
	);
}

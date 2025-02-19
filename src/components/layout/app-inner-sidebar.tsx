"use client";

import { ChatsSidebar } from "../chat/chats-sidebar";
import { Sidebar } from "../ui/sidebar";

export function AppInnerSidebar() {
	return (
		<Sidebar collapsible="none" className="hidden flex-1 md:flex">
			<ChatsSidebar />
		</Sidebar>
	);
}

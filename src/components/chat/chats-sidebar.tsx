import {
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarInput,
} from "@/components/ui/sidebar";
import { client } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";

export function ChatsSidebar() {
	return (
		<>
			<SidebarHeader className="gap-3.5 border-b p-4">
				<div className="flex w-full items-center justify-between">
					<div className="text-base font-medium text-foreground">Chats</div>
				</div>
				<SidebarInput placeholder="Search chats..." />
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup className="px-0 py-0">
					{/* <SidebarGroupContent>
						{isLoading ? (
							<ChatRoomSkeleton />
						) : chatRoomsData && chatRoomsData.length > 0 ? (
							chatRoomsData.map((chat) => (
								<button
									type="button"
									onClick={() => {
										router.push(`/chat?roomId=${chat.id}`);
									}}
									key={chat.id}
									className="flex w-full flex-col gap-1 border-b px-4 py-3 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
								>
									<div className="w-full flex items-center justify-between">
										<span className="font-medium">{chat.name}</span>
										<span className="text-xs text-muted-foreground">
											{chat.isPrivate ? "Private" : "Public"}
										</span>
									</div>
								</button>
							))
						) : (
							<div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
								No chats found
							</div>
						)}
					</SidebarGroupContent> */}
				</SidebarGroup>
			</SidebarContent>
		</>
	);
}

function ChatRoomSkeleton() {
	return (
		<div>
			<div className="flex flex-col gap-1 border-b px-4 py-3">
				<div className="flex items-center justify-between">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-3 w-12" />
				</div>
				<Skeleton className="h-3 w-16" />
			</div>
			<div className="flex flex-col gap-1 border-b px-4 py-3">
				<div className="flex items-center justify-between">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-3 w-12" />
				</div>
				<Skeleton className="h-3 w-16" />
			</div>
			<div className="flex flex-col gap-1 border-b px-4 py-3">
				<div className="flex items-center justify-between">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-3 w-12" />
				</div>
				<Skeleton className="h-3 w-16" />
			</div>
		</div>
	);
}

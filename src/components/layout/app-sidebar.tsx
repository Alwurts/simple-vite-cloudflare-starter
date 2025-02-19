"use client";

import type * as React from "react";
import { MessageSquare, Settings } from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LogoIcon } from "@/components/icons/logo-icon";
import { AppInnerSidebar } from "@/components/layout/app-inner-sidebar";

// Updated sample data with activeMatch regex
const navMain = [
	{
		title: "Chats",
		url: "/chat", // Redirect URL
		icon: MessageSquare,
		activeMatch: /^\/chat/, // Exact match for home
	},
	{
		title: "Settings",
		url: "/settings/profile", // Redirect URL
		icon: Settings,
		activeMatch: /^\/settings/, // Matches any settings route
	},
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar
			collapsible="icon"
			className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
			{...props}
		>
			{/* First sidebar - navigation icons */}
			<Sidebar
				collapsible="none"
				className="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r"
			>
				<SidebarHeader>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
								<a href="/chat">
									<div className="flex aspect-square size-8 items-center justify-center">
										<LogoIcon className="size-8" />
									</div>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-semibold">Chatsemble</span>
										<span className="truncate text-xs">Chatting with AI</span>
									</div>
								</a>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarHeader>
				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupContent className="px-1.5 md:px-0">
							<SidebarMenu>
								{navMain.map((item) => (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton
											tooltip={{
												children: item.title,
												hidden: false,
											}}
											className="px-2.5 md:px-2"
											asChild
										>
											<a href={item.url}>
												<item.icon />
												<span>{item.title}</span>
											</a>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>
				<SidebarFooter>{/* <ThemeToggle /> */}</SidebarFooter>
			</Sidebar>

			{/* Second sidebar - content */}
			<AppInnerSidebar />
		</Sidebar>
	);
}

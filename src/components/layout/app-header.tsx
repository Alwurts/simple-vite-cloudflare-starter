import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { DynamicBreadcrumb } from "@/components/layout/dynamic-breadcrumb";

export function AppHeader() {
	return (
		<header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4">
			<SidebarTrigger className="-ml-1" />
			<Separator orientation="vertical" className="mr-2 h-4" />
			<DynamicBreadcrumb />
		</header>
	);
}

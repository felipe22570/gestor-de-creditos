import NavContent from "./nav-content";
import UserMenu from "./user-menu";

interface SidebarProps {
	name: string | null | undefined;
	email: string | null | undefined;
}

/**
 * Desktop-only sticky sidebar. Hidden on small screens — see MobileSidebar
 * for the drawer trigger that the dashboard layout renders inside the topbar.
 */
export default function Sidebar({ name, email }: SidebarProps) {
	return (
		<aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-surface/80 backdrop-blur-md md:flex">
			<div className="flex h-16 items-center border-b border-border px-6">
				<span className="font-display text-subhead font-semibold tracking-heading-tight text-foreground">
					Gestor de Créditos
				</span>
			</div>
			<div className="flex-1 overflow-y-auto py-4">
				<NavContent />
			</div>
			<div className="border-t border-border p-3">
				<UserMenu name={name} email={email} />
			</div>
		</aside>
	);
}

import { auth } from "@/auth.config";
import Sidebar from "@/components/dashboard/sidebar";
import MobileSidebar from "@/components/dashboard/sidebar/mobile-sidebar";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	return (
		<div className="flex min-h-screen bg-background">
			<Sidebar name={session.user.name} email={session.user.email} />

			<div className="flex min-w-0 flex-1 flex-col">
				{/* Mobile topbar — hidden on desktop where the sticky sidebar takes over */}
				<header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur-md md:hidden">
					<MobileSidebar name={session.user.name} email={session.user.email} />
					<span className="font-display text-body font-semibold tracking-heading-tight text-foreground">
						Gestor de Créditos
					</span>
				</header>

				<main className="mx-auto w-full max-w-[1280px] flex-1 px-6 py-8 md:px-8 md:py-10">
					{children}
				</main>
			</div>
		</div>
	);
}

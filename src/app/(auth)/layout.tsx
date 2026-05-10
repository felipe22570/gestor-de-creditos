import { auth } from "@/auth.config";
import { redirect } from "next/navigation";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
	const session = await auth();

	if (session?.user) {
		redirect("/dashboard");
	}

	return (
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
			{/* Decorative dot grid (DESIGN.md: the only decorative element) */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(circle_at_center,black,transparent_70%)]"
				style={{
					backgroundImage:
						"radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)",
					backgroundSize: "24px 24px",
				}}
			/>

			<div className="relative z-10 flex w-full max-w-md flex-col items-center gap-8">
				<div className="flex flex-col items-center gap-2 text-center">
					<span className="flex h-12 w-12 items-center justify-center rounded-card bg-primary text-[20px] font-display font-semibold text-primary-foreground">
						G
					</span>
					<h1 className="font-display text-subhead font-semibold tracking-heading-tight text-foreground">
						Gestor de Créditos
					</h1>
					<p className="text-small text-text-secondary">Sistema de gestión de créditos y pagos</p>
				</div>
				{children}
			</div>
		</div>
	);
}

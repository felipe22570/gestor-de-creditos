import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
			<p className="text-overline font-semibold uppercase text-primary">404</p>
			<h1 className="mt-3 font-display text-section font-semibold tracking-heading-tight text-foreground">
				Página no encontrada
			</h1>
			<p className="mt-2 max-w-md text-body text-text-secondary">
				La página que buscas no existe o fue movida.
			</p>
			<Button asChild className="mt-6">
				<Link href="/dashboard">Volver al inicio</Link>
			</Button>
		</div>
	);
}

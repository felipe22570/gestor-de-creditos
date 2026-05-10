"use client";

import { MenuIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import NavContent from "./nav-content";
import UserMenu from "./user-menu";

interface MobileSidebarProps {
	name: string | null | undefined;
	email: string | null | undefined;
}

export default function MobileSidebar({ name, email }: MobileSidebarProps) {
	const [open, setOpen] = useState(false);

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menú">
					<MenuIcon className="h-5 w-5" />
				</Button>
			</SheetTrigger>
			<SheetContent side="left" className="flex w-72 flex-col p-0">
				<SheetTitle className="sr-only">Menú de navegación</SheetTitle>
				<div className="flex h-16 items-center border-b border-border px-6">
					<span className="font-display text-subhead font-semibold tracking-heading-tight text-foreground">
						Gestor de Créditos
					</span>
				</div>
				<div className="flex-1 overflow-y-auto py-4">
					<NavContent onNavigate={() => setOpen(false)} />
				</div>
				<div className="border-t border-border p-3">
					<UserMenu name={name} email={email} />
				</div>
			</SheetContent>
		</Sheet>
	);
}

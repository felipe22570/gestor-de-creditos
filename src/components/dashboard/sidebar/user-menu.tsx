"use client";

import { LogOutIcon, SettingsIcon, UserIcon } from "lucide-react";

import { logout } from "@/lib/actions/admin";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
	name: string | null | undefined;
	email: string | null | undefined;
}

function initialsFor(name: string | null | undefined) {
	if (!name) return "?";
	const parts = name.trim().split(/\s+/);
	const first = parts[0]?.[0] ?? "";
	const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
	return (first + last).toUpperCase() || "?";
}

export default function UserMenu({ name, email }: UserMenuProps) {
	const onLogout = async () => {
		await logout();
		window.location.replace("/login");
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors duration-200 hover:bg-muted focus-visible:outline-none focus-visible:shadow-focus-ring">
				<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-small font-semibold text-primary-foreground">
					{initialsFor(name)}
				</span>
				<span className="flex min-w-0 flex-1 flex-col">
					<span className="truncate text-small font-medium text-foreground">
						{name ?? "Usuario"}
					</span>
					{email && (
						<span className="truncate text-caption text-text-secondary">{email}</span>
					)}
				</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" side="top" className="w-56">
				<DropdownMenuLabel className="font-display text-small">Mi cuenta</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem disabled className="cursor-not-allowed">
					<UserIcon className="mr-2 h-4 w-4" />
					Perfil
				</DropdownMenuItem>
				<DropdownMenuItem disabled className="cursor-not-allowed">
					<SettingsIcon className="mr-2 h-4 w-4" />
					Configuración
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={onLogout} className="cursor-pointer text-destructive focus:text-destructive">
					<LogOutIcon className="mr-2 h-4 w-4" />
					Cerrar sesión
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

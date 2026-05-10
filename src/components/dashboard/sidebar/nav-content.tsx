"use client";

import { CheckCircleIcon, ListChecksIcon, AlertTriangleIcon, HomeIcon, CoinsIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface NavOption {
	name: string;
	href: string;
	icon: typeof HomeIcon;
	iconColor?: string;
	exact?: boolean;
}

const options: NavOption[] = [
	{ name: "Inicio", href: "/dashboard", icon: HomeIcon, exact: true },
	{
		name: "Créditos Activos",
		href: "/dashboard/credits-active",
		icon: ListChecksIcon,
		iconColor: "text-success",
	},
	{
		name: "Créditos Vencidos",
		href: "/dashboard/credits-due",
		icon: AlertTriangleIcon,
		iconColor: "text-destructive",
	},
	{
		name: "Créditos Completados",
		href: "/dashboard/credits-completed",
		icon: CheckCircleIcon,
		iconColor: "text-blue-500",
	},
	{ name: "Abonos", href: "/dashboard/payments", icon: CoinsIcon },
];

interface NavContentProps {
	onNavigate?: () => void;
}

export default function NavContent({ onNavigate }: NavContentProps) {
	const pathname = usePathname();

	return (
		<nav className="flex flex-col gap-1 px-3">
			<p className="px-3 pt-2 pb-1 text-overline font-semibold uppercase text-muted-foreground">
				Menú
			</p>
			{options.map((option) => {
				const isActive = option.exact
					? pathname === option.href
					: pathname?.startsWith(option.href);
				const Icon = option.icon;

				return (
					<Link
						key={option.name}
						href={option.href}
						onClick={onNavigate}
						className={cn(
							"group flex items-center gap-3 rounded-md px-3 py-2 text-small font-medium transition-colors duration-200",
							"focus-visible:outline-none focus-visible:shadow-focus-ring",
							isActive
								? "bg-primary/10 text-primary"
								: "text-text-secondary hover:bg-muted hover:text-foreground"
						)}
					>
						<Icon
							className={cn(
								"h-[18px] w-[18px] shrink-0 transition-colors",
								option.iconColor ??
									(isActive
										? "text-primary"
										: "text-muted-foreground group-hover:text-foreground")
							)}
						/>
						<span className="truncate">{option.name}</span>
					</Link>
				);
			})}
		</nav>
	);
}

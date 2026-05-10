import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface StatCardProps {
	label: string;
	value: ReactNode;
	icon?: LucideIcon;
	tone?: "default" | "success" | "destructive" | "info" | "warning";
	hint?: string;
}

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, { iconBg: string; iconText: string; valueText: string }> = {
	default: {
		iconBg: "bg-muted",
		iconText: "text-text-secondary",
		valueText: "text-foreground",
	},
	success: {
		iconBg: "bg-success/10",
		iconText: "text-success",
		valueText: "text-foreground",
	},
	destructive: {
		iconBg: "bg-destructive/10",
		iconText: "text-destructive",
		valueText: "text-foreground",
	},
	info: {
		iconBg: "bg-blue-500/10",
		iconText: "text-blue-500",
		valueText: "text-foreground",
	},
	warning: {
		iconBg: "bg-warning/10",
		iconText: "text-warning",
		valueText: "text-foreground",
	},
};

export default function StatCard({ label, value, icon: Icon, tone = "default", hint }: StatCardProps) {
	const palette = toneClasses[tone];

	return (
		<div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
			<div className="flex items-start justify-between gap-3">
				<p className="text-overline font-semibold uppercase text-muted-foreground">{label}</p>
				{Icon && (
					<span className={cn("flex h-8 w-8 items-center justify-center rounded-md", palette.iconBg)}>
						<Icon className={cn("h-4 w-4", palette.iconText)} />
					</span>
				)}
			</div>
			<p className={cn("font-display text-[28px] font-semibold tracking-heading-tight", palette.valueText)}>
				{value}
			</p>
			{hint && <p className="text-caption text-text-secondary">{hint}</p>}
		</div>
	);
}

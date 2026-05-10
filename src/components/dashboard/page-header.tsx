import { ReactNode } from "react";

interface PageHeaderProps {
	title: string;
	description?: string;
	action?: ReactNode;
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
	return (
		<header className="flex flex-col gap-4 pb-8 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
			<div className="min-w-0 space-y-1">
				<h1 className="font-display text-section font-semibold tracking-heading-tight text-foreground">
					{title}
				</h1>
				{description && <p className="text-body text-text-secondary">{description}</p>}
			</div>
			{action && <div className="shrink-0">{action}</div>}
		</header>
	);
}

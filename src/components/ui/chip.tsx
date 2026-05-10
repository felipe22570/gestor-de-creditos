import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Pill-shape badge per DESIGN.md spec. Variants are explicit (no boolean
// modes) per the vercel-composition-patterns guidance: callers pick a single
// variant string rather than toggling overlapping booleans.
const chipVariants = cva(
	"inline-flex items-center justify-center rounded-full font-medium whitespace-nowrap transition-colors",
	{
		variants: {
			variant: {
				default: "bg-muted text-text-secondary",
				active: "bg-primary text-primary-foreground",
				success: "bg-success/10 text-success border border-success/20",
				warning: "bg-warning/10 text-warning border border-warning/20",
				destructive: "bg-destructive/10 text-destructive border border-destructive/20",
				// Semantic credit-state aliases used in dashboard tables
				overdue: "bg-destructive/10 text-destructive border border-destructive/20",
				ontrack: "bg-success/10 text-success border border-success/20",
				completed: "bg-muted text-text-secondary border border-border",
			},
			size: {
				sm: "px-2 py-0.5 text-overline",
				md: "px-3 py-1 text-caption",
				lg: "px-4 py-1.5 text-small",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "md",
		},
	}
);

export interface ChipProps
	extends React.HTMLAttributes<HTMLSpanElement>,
		VariantProps<typeof chipVariants> {}

const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(({ className, variant, size, ...props }, ref) => (
	<span ref={ref} className={cn(chipVariants({ variant, size, className }))} {...props} />
));
Chip.displayName = "Chip";

export { Chip, chipVariants };

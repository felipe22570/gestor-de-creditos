import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:shadow-focus-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				// Primary: indigo fill, white text, hover lift + glow
				default:
					"bg-primary text-primary-foreground hover:bg-primary-hover hover:-translate-y-px hover:shadow-primary-glow",
				// Secondary: transparent with 1px border (DESIGN.md spec)
				secondary:
					"border border-border bg-transparent text-foreground hover:bg-muted hover:-translate-y-px",
				// Outline: alias of secondary, kept for backward compat
				outline:
					"border border-border bg-transparent text-foreground hover:bg-muted hover:-translate-y-px",
				// Ghost: no border or bg, text-color shift only
				ghost: "text-foreground hover:bg-muted hover:text-foreground",
				// Destructive: red text + red border (DESIGN.md spec)
				destructive:
					"border border-destructive bg-transparent text-destructive hover:bg-destructive hover:text-destructive-foreground",
				// Link: kept for backward compat
				link: "text-primary underline-offset-4 hover:underline hover:text-primary-hover",
			},
			size: {
				// DESIGN.md: small 32px, medium 38px, large 44px
				sm: "h-8 px-3 text-small",
				default: "h-[38px] px-4 text-small",
				lg: "h-11 px-6 text-body",
				icon: "h-[38px] w-[38px]",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
	}
);
Button.displayName = "Button";

export { Button, buttonVariants };

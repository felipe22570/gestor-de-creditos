import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
	return (
		<textarea
			className={cn(
				"flex min-h-[80px] w-full rounded-md border border-border bg-surface px-[14px] py-[10px] text-small text-foreground transition-all duration-200",
				"placeholder:text-muted-foreground",
				"focus-visible:outline-none focus-visible:border-primary focus-visible:shadow-focus-ring",
				"disabled:cursor-not-allowed disabled:opacity-50",
				"aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]",
				className
			)}
			ref={ref}
			{...props}
		/>
	);
});
Textarea.displayName = "Textarea";

export { Textarea };

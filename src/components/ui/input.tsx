import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
	return (
		<input
			type={type}
			className={cn(
				"flex h-[38px] w-full rounded-md border border-border bg-surface px-[14px] py-[10px] text-small text-foreground transition-all duration-200",
				"file:border-0 file:bg-transparent file:text-small file:font-medium file:text-foreground",
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
Input.displayName = "Input";

export { Input };

"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import type { DropdownProps } from "react-day-picker";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

// Replaces the native <select> with Radix Select to avoid OS-rendered popup
// artifacts. option.value is a number; Radix requires strings, so we convert.
function CalendarDropdown({
	value,
	onChange,
	options,
	disabled,
	"aria-label": ariaLabel,
}: DropdownProps) {
	return (
		<Select
			value={String(value)}
			onValueChange={(v) =>
				onChange?.({
					target: { value: v },
				} as React.ChangeEvent<HTMLSelectElement>)
			}
			disabled={disabled}
		>
			<SelectTrigger
				aria-label={ariaLabel}
				className="h-7 w-auto gap-1 px-2.5 py-0 text-sm font-semibold shadow-sm focus:ring-offset-0"
			>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{options?.map(({ value: v, label, disabled: d }) => (
					<SelectItem key={v} value={String(v)} disabled={d}>
						{label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

// `months` is `relative` so the Nav's `absolute` position overlays the caption
// row correctly (the Nav lives inside Months, not MonthCaption, in v9).
function Calendar({
	className,
	classNames,
	showOutsideDays = true,
	captionLayout = "dropdown",
	startMonth = new Date(2020, 0),
	endMonth = new Date(2030, 11),
	...props
}: CalendarProps) {
	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			captionLayout={captionLayout}
			startMonth={startMonth}
			endMonth={endMonth}
			className={cn("p-3 pointer-events-auto", className)}
			classNames={{
				months: "flex flex-col sm:flex-row gap-4 relative",
				month: "space-y-4",
				month_caption: "flex justify-center pt-1 items-center h-9",
				caption_label: "text-sm font-semibold",
				dropdowns: "flex items-center gap-1.5",
				nav: "absolute inset-x-0 top-0 flex justify-between items-center px-1 pt-1 h-9 z-10 pointer-events-none",
				button_previous: cn(
					buttonVariants({ variant: "outline" }),
					"h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 pointer-events-auto"
				),
				button_next: cn(
					buttonVariants({ variant: "outline" }),
					"h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 pointer-events-auto"
				),
				month_grid: "w-full border-collapse space-y-1",
				weekdays: "flex",
				weekday:
					"text-muted-foreground rounded-md w-8 font-normal text-[0.8rem] text-center",
				week: "flex w-full mt-2",
				day: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
				day_button: cn(
					buttonVariants({ variant: "ghost" }),
					"h-8 w-8 p-0 font-normal aria-selected:opacity-100"
				),
				range_start: "day-range-start",
				range_end: "day-range-end",
				selected:
					"bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
				today: "bg-accent text-accent-foreground",
				outside:
					"day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
				disabled: "text-muted-foreground opacity-50",
				range_middle:
					"aria-selected:bg-accent aria-selected:text-accent-foreground",
				hidden: "invisible",
				...classNames,
			}}
			components={{
				Dropdown: CalendarDropdown,
				Chevron: ({ orientation, className: chevronClassName }) => {
					const Icon =
						orientation === "left" ? ChevronLeftIcon : ChevronRightIcon;
					return <Icon className={cn("h-4 w-4", chevronClassName)} />;
				},
			}}
			{...props}
		/>
	);
}
Calendar.displayName = "Calendar";

export { Calendar };

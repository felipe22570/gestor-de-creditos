"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Props {
	value: Date | undefined;
	onChange: (date: Date | undefined) => void;
}

export function DatePicker({ value: date, onChange }: Props) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant={"outline"}
					className={cn(
						"w-[280px] justify-start text-left font-normal",
						!date && "text-muted-foreground"
					)}
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{date ? format(date, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0 z-50">
				<Calendar
					mode="single"
					selected={date}
					onSelect={onChange}
					initialFocus
					locale={es}
					className="z-50"
				/>
			</PopoverContent>
		</Popover>
	);
}

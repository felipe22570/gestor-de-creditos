"use client";

import { Payment } from "@/types/schema";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./colums";
import {
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	useReactTable,
	VisibilityState,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

interface Props {
	data: Payment[];
}

export default function PaymentsTable({ data }: Props) {
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [globalFilter, setGlobalFilter] = useState<unknown>([]);

	const table = useReactTable({
		columns,
		data,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		state: {
			columnVisibility,
			globalFilter,
		},
		onGlobalFilterChange: setGlobalFilter,
	});

	return (
		<div className="">
			<div className="flex justify-between mt-10 mb-5">
				<Input
					type="text"
					placeholder="Buscar..."
					onChange={(e) => table.setGlobalFilter(String(e.target.value))}
					className="w-1/3"
				/>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="ml-auto">
							Columnas
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{table
							.getAllColumns()
							.filter((column) => column.getCanHide())
							.map((column) => {
								return (
									<DropdownMenuCheckboxItem
										key={column.id}
										className="capitalize"
										checked={column.getIsVisible()}
										onCheckedChange={(value) =>
											column.toggleVisibility(!!value)
										}
									>
										{column.columnDef.header as string}
									</DropdownMenuCheckboxItem>
								);
							})}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<div className="flex flex-col gap-5">
				<DataTable table={table} />
				<DataTablePagination table={table} />
			</div>
		</div>
	);
}

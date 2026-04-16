"use client";

import { Payment } from "@/types/schema";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import {
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	VisibilityState,
	SortingState,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
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
	const [sorting, setSorting] = useState<SortingState>([]);

	const table = useReactTable({
		columns,
		data,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onSortingChange: setSorting,
		state: {
			columnVisibility,
			globalFilter,
			sorting,
		},
		onGlobalFilterChange: setGlobalFilter,
	});

	const totals = useMemo(() => {
		const totalRecaudado = data.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
		const capitalCount = data.filter((p) => p.paymentType === "CAPITAL").length;
		const interestCount = data.filter((p) => p.paymentType === "INTEREST").length;
		const fullCount = data.filter((p) => p.paymentType === "FULL").length;
		return { totalRecaudado, capitalCount, interestCount, fullCount, total: data.length };
	}, [data]);

	return (
		<div className="">
			{/* Summary Section */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6 p-4 bg-muted/30 rounded-lg border">
				<div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border col-span-2 md:col-span-1">
					<h3 className="text-sm font-medium text-muted-foreground mb-1">Total Recaudado</h3>
					<p className="text-2xl font-bold text-green-600">
						{new Intl.NumberFormat("es-CO", {
							style: "currency",
							currency: "COP",
						}).format(totals.totalRecaudado)}
					</p>
				</div>
				<div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border">
					<h3 className="text-sm font-medium text-muted-foreground mb-1">Capital</h3>
					<p className="text-2xl font-bold text-blue-600">{totals.capitalCount}</p>
				</div>
				<div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border">
					<h3 className="text-sm font-medium text-muted-foreground mb-1">Interés</h3>
					<p className="text-2xl font-bold text-yellow-600">{totals.interestCount}</p>
				</div>
				<div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border">
					<h3 className="text-sm font-medium text-muted-foreground mb-1">Completos</h3>
					<p className="text-2xl font-bold text-purple-600">{totals.fullCount}</p>
				</div>
			</div>

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

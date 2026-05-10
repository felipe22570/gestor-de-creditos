"use client";

import {
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable,
	VisibilityState,
} from "@tanstack/react-table";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import StatCard from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { formatCOP } from "@/lib/utils";
import { Payment } from "@/types/schema";

import { columns } from "./columns";

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
		state: { columnVisibility, globalFilter, sorting },
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
		<div className="space-y-6">
			<section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				<StatCard
					label="Total Recaudado"
					value={formatCOP(totals.totalRecaudado)}
					tone="success"
					hint={`${totals.total} pagos en total`}
				/>
				<StatCard label="Capital" value={totals.capitalCount} tone="info" />
				<StatCard label="Interés" value={totals.interestCount} tone="warning" />
				<StatCard label="Pagos Completos" value={totals.fullCount} tone="default" />
			</section>

			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="relative w-full sm:max-w-sm">
					<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Buscar..."
						onChange={(e) => table.setGlobalFilter(String(e.target.value))}
						className="pl-9 rounded-card"
					/>
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="secondary">Columnas</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{table
							.getAllColumns()
							.filter((column) => column.getCanHide())
							.map((column) => (
								<DropdownMenuCheckboxItem
									key={column.id}
									className="capitalize"
									checked={column.getIsVisible()}
									onCheckedChange={(value) => column.toggleVisibility(!!value)}
								>
									{column.columnDef.header as string}
								</DropdownMenuCheckboxItem>
							))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<div className="flex flex-col gap-4">
				<DataTable table={table} />
				<DataTablePagination table={table} />
			</div>
		</div>
	);
}

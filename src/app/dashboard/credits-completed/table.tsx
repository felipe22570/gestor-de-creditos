"use client";

import {
	ColumnDef,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable,
	VisibilityState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { History, MoreHorizontal, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import StatCard from "@/components/dashboard/stat-card";
import ViewPaymentsModal from "@/components/modals/view-payments";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { formatCOP } from "@/lib/utils";
import { Credit } from "@/types/schema";

interface Props {
	data: Credit[];
	totalRecaudado: number;
}

export default function CreditsCompletedTable({ data, totalRecaudado }: Props) {
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [globalFilter, setGlobalFilter] = useState<unknown>([]);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [openViewPaymentsModal, setOpenViewPaymentsModal] = useState(false);
	const [creditToViewPayments, setCreditToViewPayments] = useState<Credit | null>(null);

	const columns: ColumnDef<Credit>[] = [
		{
			id: "select",
			header: ({ table }) => (
				<Checkbox
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() && "indeterminate")
					}
					onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
					aria-label="Seleccionar todo"
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					aria-label="Seleccionar fila"
				/>
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "startDate",
			header: ({ column }) => (
				<Button
					variant="ghost"
					size="sm"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="-ml-3 h-8 px-3 text-overline uppercase font-semibold text-muted-foreground"
				>
					Fecha
					{column.getIsSorted() === "asc"
						? " ↑"
						: column.getIsSorted() === "desc"
						? " ↓"
						: ""}
				</Button>
			),
			cell: ({ row }) => (
				<span className="whitespace-nowrap font-mono text-small tabular-nums text-foreground">
					{format(new Date(row.getValue("startDate")), "dd/MM/yyyy")}
				</span>
			),
		},
		{ accessorKey: "clientCardId", header: "Cédula" },
		{ accessorKey: "clientName", header: "Nombre" },
		{ accessorKey: "clientPhone", header: "Teléfono" },
		{ accessorKey: "productName", header: "Producto" },
		{
			accessorKey: "initialAmount",
			header: "Monto Inicial",
			cell: ({ row }) => (
				<span className="font-mono text-small font-medium tabular-nums text-foreground">
					{formatCOP(Number(row.getValue("initialAmount")))}
				</span>
			),
		},
		{
			accessorKey: "interestRate",
			header: "Tasa",
			cell: ({ row }) => (
				<span className="text-small font-medium text-foreground">{row.getValue("interestRate")}%</span>
			),
		},
		{
			id: "actions",
			cell: ({ row }) => {
				const credit = row.original;
				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="h-8 w-8">
								<span className="sr-only">Abrir menú</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>Acciones</DropdownMenuLabel>
							<DropdownMenuItem
								onClick={() => onViewPayments(credit)}
								className="cursor-pointer"
							>
								<History className="mr-2 h-4 w-4 text-muted-foreground" />
								Ver pagos
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];

	const onViewPayments = (credit: Credit) => {
		setCreditToViewPayments(credit);
		setOpenViewPaymentsModal(true);
	};

	useEffect(() => {
		if (!openViewPaymentsModal) setCreditToViewPayments(null);
	}, [openViewPaymentsModal]);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onSortingChange: setSorting,
		state: { columnVisibility, globalFilter, sorting },
		onGlobalFilterChange: setGlobalFilter,
	});

	const totals = useMemo(() => {
		const initialAmountTotal = data.reduce(
			(sum, credit) => sum + (Number(credit.initialAmount) ?? 0),
			0
		);
		return { initialAmount: initialAmountTotal };
	}, [data]);

	return (
		<div className="space-y-6">
			<section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<StatCard
					label="Total Capital Prestado"
					value={formatCOP(totals.initialAmount)}
					tone="info"
					hint={`${data.length} créditos completados`}
				/>
				<StatCard
					label="Total Recaudado"
					value={formatCOP(totalRecaudado)}
					tone="success"
					hint="Suma de todos los abonos realizados"
				/>
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

			{creditToViewPayments && (
				<ViewPaymentsModal
					isOpen={openViewPaymentsModal}
					setIsOpen={setOpenViewPaymentsModal}
					credit={creditToViewPayments}
				/>
			)}
		</div>
	);
}

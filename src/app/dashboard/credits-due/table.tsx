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
import {
	CircleDollarSign,
	History,
	MoreHorizontal,
	Pencil,
	Printer,
	Search,
	Trash,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import StatCard from "@/components/dashboard/stat-card";
import DeleteCreditModal from "@/components/modals/delete-credit";
import EditCreditModal from "@/components/modals/edit-credit";
import PaymentFullModal from "@/components/modals/payment-full";
import PaymentInterestModal from "@/components/modals/payment-interest";
import PaymentModal from "@/components/modals/payment";
import PrintInvoiceModal from "@/components/modals/print-invoice-modal";
import ViewPaymentsModal from "@/components/modals/view-payments";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Chip } from "@/components/ui/chip";
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
import { fetchCreditById } from "@/lib/actions/credit";
import { formatCOP } from "@/lib/utils";
import { Credit } from "@/types/schema";

interface Props {
	data: Credit[];
}

export default function CreditsDueTable({ data }: Props) {
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [globalFilter, setGlobalFilter] = useState<unknown>([]);
	const [sorting, setSorting] = useState<SortingState>([{ id: "diasAtraso", desc: true }]);
	const [openEditCreditModal, setOpenEditCreditModal] = useState(false);
	const [openDeleteCreditModal, setOpenDeleteCreditModal] = useState(false);
	const [creditToEdit, setCreditToEdit] = useState<Credit | null>(null);
	const [creditToDelete, setCreditToDelete] = useState<number | null>(null);
	const [openPaymentModal, setOpenPaymentModal] = useState(false);
	const [creditToPay, setCreditToPay] = useState<Credit | null>(null);
	const [openPaymentInterestModal, setOpenPaymentInterestModal] = useState(false);
	const [creditToPayInterest, setCreditToPayInterest] = useState<Credit | null>(null);
	const [openPaymentFullModal, setOpenPaymentFullModal] = useState(false);
	const [creditToPayFull, setCreditToPayFull] = useState<Credit | null>(null);
	const [openViewPaymentsModal, setOpenViewPaymentsModal] = useState(false);
	const [creditToViewPayments, setCreditToViewPayments] = useState<Credit | null>(null);
	const [openPrintInvoiceModal, setOpenPrintInvoiceModal] = useState(false);
	const [creditToPrint, setCreditToPrint] = useState<Credit | null>(null);

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
		{
			accessorKey: "nextPaymentDate",
			header: "Fecha de Pago",
			cell: ({ row }) => {
				const nextPaymentDate = row.getValue("nextPaymentDate");
				if (!nextPaymentDate) return <span className="text-small text-text-secondary">—</span>;
				return (
					<span className="whitespace-nowrap font-mono text-small font-semibold tabular-nums text-destructive">
						{format(new Date(nextPaymentDate as number), "dd/MM/yyyy")}
					</span>
				);
			},
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
			accessorKey: "interestAmount",
			header: "Monto de Interés",
			cell: ({ row }) => {
				const interestAmount = Number(row.getValue("interestAmount"));
				if (!interestAmount) return <span className="text-small text-text-secondary">—</span>;
				return (
					<span className="font-mono text-small font-medium tabular-nums text-foreground">
						{formatCOP(interestAmount)}
					</span>
				);
			},
		},
		{
			accessorKey: "totalAmount",
			header: "Monto Total",
			cell: ({ row }) => {
				const totalAmount = Number(row.getValue("totalAmount"));
				const interestAmount = row.original.interestAmount
					? Number(row.original.interestAmount)
					: 0;
				return (
					<span className="font-mono text-small font-semibold tabular-nums text-foreground">
						{formatCOP(totalAmount + interestAmount)}
					</span>
				);
			},
		},
		{
			id: "diasAtraso",
			header: "Días de Atraso",
			cell: ({ row }) => {
				const nextPaymentDate = row.original.nextPaymentDate;
				if (!nextPaymentDate) return <span className="text-small text-text-secondary">—</span>;
				const days = Math.floor(
					(Date.now() - new Date(nextPaymentDate as string | number | Date).getTime()) /
						(1000 * 60 * 60 * 24)
				);
				return (
					<Chip variant="overdue" size="sm">
						{days} {days === 1 ? "día" : "días"}
					</Chip>
				);
			},
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
								onClick={() => onPayCredit(credit)}
								className="cursor-pointer"
							>
								<CircleDollarSign className="mr-2 h-4 w-4 text-success" />
								Abonar a capital
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onPayInterest(credit)}
								className="cursor-pointer"
							>
								<CircleDollarSign className="mr-2 h-4 w-4 text-warning" />
								Abonar interés
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onPayFull(credit)}
								className="cursor-pointer"
							>
								<CircleDollarSign className="mr-2 h-4 w-4 text-success" />
								Pagar completo
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onViewPayments(credit)}
								className="cursor-pointer"
							>
								<History className="mr-2 h-4 w-4 text-muted-foreground" />
								Ver pagos
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onPrintInvoice(credit)}
								className="cursor-pointer"
							>
								<Printer className="mr-2 h-4 w-4 text-muted-foreground" />
								Imprimir factura
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onEditCredit(credit.id as number)}
								className="cursor-pointer"
							>
								<Pencil className="mr-2 h-4 w-4 text-muted-foreground" />
								Editar
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onDeleteCredit(credit.id as number)}
								className="cursor-pointer text-destructive focus:text-destructive"
							>
								<Trash className="mr-2 h-4 w-4" />
								Borrar
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];

	const onEditCredit = async (creditId: number) => {
		const credit = await fetchCreditById(creditId);
		setCreditToEdit(credit);
		setOpenEditCreditModal(true);
	};
	const onDeleteCredit = async (creditId: number) => {
		setCreditToDelete(creditId);
		setOpenDeleteCreditModal(true);
	};
	const onPayCredit = async (credit: Credit) => {
		setCreditToPay(credit);
		setOpenPaymentModal(true);
	};
	const onPayInterest = (credit: Credit) => {
		setCreditToPayInterest(credit);
		setOpenPaymentInterestModal(true);
	};
	const onPayFull = (credit: Credit) => {
		setCreditToPayFull(credit);
		setOpenPaymentFullModal(true);
	};
	const onViewPayments = (credit: Credit) => {
		setCreditToViewPayments(credit);
		setOpenViewPaymentsModal(true);
	};
	const onPrintInvoice = (credit: Credit) => {
		setCreditToPrint(credit);
		setOpenPrintInvoiceModal(true);
	};

	useEffect(() => {
		if (!openEditCreditModal) setCreditToEdit(null);
	}, [openEditCreditModal]);
	useEffect(() => {
		if (!openDeleteCreditModal) setCreditToDelete(null);
	}, [openDeleteCreditModal]);
	useEffect(() => {
		if (!openPaymentModal) setCreditToPay(null);
	}, [openPaymentModal]);
	useEffect(() => {
		if (!openPaymentInterestModal) setCreditToPayInterest(null);
	}, [openPaymentInterestModal]);
	useEffect(() => {
		if (!openPaymentFullModal) setCreditToPayFull(null);
	}, [openPaymentFullModal]);
	useEffect(() => {
		if (!openViewPaymentsModal) setCreditToViewPayments(null);
	}, [openViewPaymentsModal]);
	useEffect(() => {
		if (!openPrintInvoiceModal) setCreditToPrint(null);
	}, [openPrintInvoiceModal]);

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
		const totalAmountTotal = data.reduce((sum, credit) => {
			const totalAmount = Number(credit.totalAmount) ?? 0;
			const interestAmount = credit.interestAmount ? Number(credit.interestAmount) : 0;
			return sum + totalAmount + interestAmount;
		}, 0);
		return { initialAmount: initialAmountTotal, totalAmount: totalAmountTotal };
	}, [data]);

	return (
		<div className="space-y-6">
			<section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<StatCard
					label="Total Monto Inicial"
					value={formatCOP(totals.initialAmount)}
					tone="info"
					hint={`${data.length} créditos vencidos`}
				/>
				<StatCard
					label="Total Monto Restante"
					value={formatCOP(totals.totalAmount)}
					tone="destructive"
					hint="Capital + interés pendiente"
				/>
			</section>

			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="relative w-full sm:max-w-sm">
					<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Buscar..."
						value={(globalFilter as string) ?? ""}
						onChange={(event) => table.setGlobalFilter(event.target.value)}
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

			{openEditCreditModal && creditToEdit && (
				<EditCreditModal
					isOpen={openEditCreditModal}
					setIsOpen={setOpenEditCreditModal}
					credit={creditToEdit}
				/>
			)}
			{openDeleteCreditModal && creditToDelete && (
				<DeleteCreditModal
					isOpen={openDeleteCreditModal}
					setIsOpen={setOpenDeleteCreditModal}
					creditId={creditToDelete}
				/>
			)}
			{openPaymentModal && creditToPay && (
				<PaymentModal
					isOpen={openPaymentModal}
					setIsOpen={setOpenPaymentModal}
					credit={creditToPay}
				/>
			)}
			{openPaymentInterestModal && creditToPayInterest && (
				<PaymentInterestModal
					isOpen={openPaymentInterestModal}
					setIsOpen={setOpenPaymentInterestModal}
					credit={creditToPayInterest}
				/>
			)}
			{openPaymentFullModal && creditToPayFull && (
				<PaymentFullModal
					isOpen={openPaymentFullModal}
					setIsOpen={setOpenPaymentFullModal}
					credit={creditToPayFull}
				/>
			)}
			{openViewPaymentsModal && creditToViewPayments && (
				<ViewPaymentsModal
					isOpen={openViewPaymentsModal}
					setIsOpen={setOpenViewPaymentsModal}
					credit={creditToViewPayments}
				/>
			)}
			{creditToPrint && (
				<PrintInvoiceModal
					isOpen={openPrintInvoiceModal}
					onClose={() => setOpenPrintInvoiceModal(false)}
					credit={creditToPrint}
				/>
			)}
		</div>
	);
}

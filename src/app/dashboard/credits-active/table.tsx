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

import DeleteCreditModal from "@/components/modals/delete-credit";
import EditCreditModal from "@/components/modals/edit-credit";
import PaymentFullModal from "@/components/modals/payment-full";
import PaymentInterestModal from "@/components/modals/payment-interest";
import PaymentModal from "@/components/modals/payment";
import PrintInvoiceModal from "@/components/modals/print-invoice-modal";
import StatCard from "@/components/dashboard/stat-card";
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
import { TableCell, TableRow } from "@/components/ui/table";
import { fetchCreditById } from "@/lib/actions/credit";
import { cn, formatCOP } from "@/lib/utils";
import { Credit } from "@/types/schema";

interface Props {
	data: Credit[];
}

export default function CreditsActiveTable({ data }: Props) {
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [globalFilter, setGlobalFilter] = useState<unknown>([]);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [openEditCreditModal, setOpenEditCreditModal] = useState(false);
	const [openDeleteCreditModal, setOpenDeleteCreditModal] = useState(false);
	const [creditToEdit, setCreditToEdit] = useState<Credit | null>(null);
	const [creditToDelete, setCreditToDelete] = useState<number | null>(null);
	const [openPaymentModal, setOpenPaymentModal] = useState(false);
	const [creditToPay, setCreditToPay] = useState<Credit | null>(null);
	const [paymentType, setPaymentType] = useState("CAPITAL");
	const [openViewPaymentsModal, setOpenViewPaymentsModal] = useState(false);
	const [creditToViewPayments, setCreditToViewPayments] = useState<Credit | null>(null);
	const [openPaymentFullModal, setOpenPaymentFullModal] = useState(false);
	const [creditToPayFull, setCreditToPayFull] = useState<Credit | null>(null);
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
				const amount = row.getValue("interestAmount") ? Number(row.getValue("interestAmount")) : 0;
				if (!amount) return <span className="text-small text-text-secondary">—</span>;
				return (
					<span className="font-mono text-small font-medium tabular-nums text-foreground">
						{formatCOP(amount)}
					</span>
				);
			},
		},
		{
			accessorKey: "totalAmount",
			header: "Monto Total",
			cell: ({ row }) => {
				const totalAmount = Number(row.getValue("totalAmount")) ?? 0;
				const interestAmount = row.getValue("interestAmount")
					? Number(row.getValue("interestAmount"))
					: 0;
				const total = totalAmount + interestAmount;
				return (
					<span className="font-mono text-small font-semibold tabular-nums text-foreground">
						{formatCOP(total)}
					</span>
				);
			},
		},
		{
			accessorKey: "nextPaymentDate",
			header: "Próximo Pago",
			cell: ({ row }) => {
				const nextPaymentDate = row.getValue("nextPaymentDate");
				if (!nextPaymentDate) {
					return <span className="text-small text-text-secondary">No establecido</span>;
				}
				const paymentDate = new Date(nextPaymentDate as string | number);
				const currentDate = new Date();
				currentDate.setHours(0, 0, 0, 0);
				const isOverdue = paymentDate < currentDate;

				return (
					<div suppressHydrationWarning className="flex items-center gap-2 whitespace-nowrap">
						<span className="font-mono text-small font-medium tabular-nums text-foreground">
							{format(paymentDate, "dd/MM/yyyy")}
						</span>
						<Chip variant={isOverdue ? "overdue" : "ontrack"} size="sm">
							{isOverdue ? "Vencido" : "Al día"}
						</Chip>
					</div>
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
							<DropdownMenuItem onClick={() => onViewPayments(credit)} className="cursor-pointer">
								<History className="mr-2 h-4 w-4 text-muted-foreground" />
								Ver pagos
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => onPrintInvoice(credit)} className="cursor-pointer">
								<Printer className="mr-2 h-4 w-4 text-muted-foreground" />
								Imprimir factura
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onPayCredit(credit, "CAPITAL")}
								className="cursor-pointer"
							>
								<CircleDollarSign className="mr-2 h-4 w-4 text-success" />
								Abonar a capital
							</DropdownMenuItem>
							{Number(credit.interestAmount) > 0 && (
								<DropdownMenuItem
									onClick={() => onPayCredit(credit, "INTEREST")}
									className="cursor-pointer"
								>
									<CircleDollarSign className="mr-2 h-4 w-4 text-warning" />
									Abonar interés
								</DropdownMenuItem>
							)}
							<DropdownMenuItem onClick={() => onPayFull(credit)} className="cursor-pointer">
								<CircleDollarSign className="mr-2 h-4 w-4 text-success" />
								Pagar completo
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onEditCredit(credit.id)}
								className="cursor-pointer"
							>
								<Pencil className="mr-2 h-4 w-4 text-muted-foreground" />
								Editar
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onDeleteCredit(credit.id)}
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
		if (credit) {
			setCreditToEdit(credit);
			setOpenEditCreditModal(true);
		}
	};
	const onDeleteCredit = async (creditId: number) => {
		setCreditToDelete(creditId);
		setOpenDeleteCreditModal(true);
	};
	const onPayCredit = async (credit: Credit, type: "CAPITAL" | "INTEREST") => {
		setCreditToPay(credit);
		setOpenPaymentModal(true);
		setPaymentType(type);
	};
	const onViewPayments = (credit: Credit) => {
		setCreditToViewPayments(credit);
		setOpenViewPaymentsModal(true);
	};
	const onPrintInvoice = (credit: Credit) => {
		setCreditToPrint(credit);
		setOpenPrintInvoiceModal(true);
	};
	const onPayFull = (credit: Credit) => {
		setCreditToPayFull(credit);
		setOpenPaymentFullModal(true);
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
		if (!openViewPaymentsModal) setCreditToViewPayments(null);
	}, [openViewPaymentsModal]);
	useEffect(() => {
		if (!openPaymentFullModal) setCreditToPayFull(null);
	}, [openPaymentFullModal]);

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

	const rows = table.getRowModel().rows;
	const subtotal = useMemo(
		() =>
			rows.reduce((sum, row) => {
				const credit = row.original;
				const totalAmount = Number(credit.totalAmount) ?? 0;
				const interestAmount = credit.interestAmount ? Number(credit.interestAmount) : 0;
				return sum + totalAmount + interestAmount;
			}, 0),
		[rows]
	);

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

	const visibleColumns = table.getVisibleLeafColumns();
	const footerContent = useMemo(() => {
		const totalAmountColumnIndex = visibleColumns.findIndex((col) => col.id === "totalAmount");

		return (
			<TableRow className="bg-muted/40 hover:bg-muted/40">
				{visibleColumns.map((column, index) => (
					<TableCell
						key={column.id}
						className={cn("font-semibold", index === 0 ? "text-left" : "")}
					>
						{index === 0 ? (
							<span className="text-overline uppercase tracking-wide text-text-secondary">
								Subtotal
							</span>
						) : index === totalAmountColumnIndex ? (
							<span className="font-mono text-small font-semibold tabular-nums text-foreground">
								{formatCOP(subtotal)}
							</span>
						) : (
							""
						)}
					</TableCell>
				))}
			</TableRow>
		);
	}, [visibleColumns, subtotal]);

	return (
		<div>
			<section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<StatCard
					label="Total Monto Inicial"
					value={formatCOP(totals.initialAmount)}
					tone="info"
					hint={`${data.length} créditos en cartera`}
				/>
				<StatCard
					label="Total Monto Restante"
					value={formatCOP(totals.totalAmount)}
					tone="success"
					hint="Capital + interés pendiente"
				/>
			</section>

			<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

			<div className="mt-4 flex flex-col gap-4">
				<DataTable table={table} showFooter footerContent={footerContent} />
				<DataTablePagination table={table} />
			</div>

			{creditToEdit && (
				<EditCreditModal
					isOpen={openEditCreditModal}
					setIsOpen={setOpenEditCreditModal}
					credit={creditToEdit}
				/>
			)}
			{creditToDelete && (
				<DeleteCreditModal
					isOpen={openDeleteCreditModal}
					setIsOpen={setOpenDeleteCreditModal}
					creditId={creditToDelete}
				/>
			)}
			{creditToPay && paymentType === "CAPITAL" && (
				<PaymentModal
					isOpen={openPaymentModal}
					setIsOpen={setOpenPaymentModal}
					credit={creditToPay}
				/>
			)}
			{creditToPay && paymentType === "INTEREST" && (
				<PaymentInterestModal
					isOpen={openPaymentModal}
					setIsOpen={setOpenPaymentModal}
					credit={creditToPay}
				/>
			)}
			{creditToViewPayments && (
				<ViewPaymentsModal
					isOpen={openViewPaymentsModal}
					setIsOpen={setOpenViewPaymentsModal}
					credit={creditToViewPayments}
				/>
			)}
			{creditToPayFull && (
				<PaymentFullModal
					isOpen={openPaymentFullModal}
					setIsOpen={setOpenPaymentFullModal}
					credit={creditToPayFull}
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

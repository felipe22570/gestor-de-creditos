"use client";

import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Credit } from "@/types/schema";
import {
	ColumnDef,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	VisibilityState,
	SortingState,
} from "@tanstack/react-table";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuItem,
	DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import EditCreditModal from "@/components/modals/edit-credit";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { CircleDollarSign, History, MoreHorizontal, Pencil, Printer, Trash } from "lucide-react";
import PrintInvoiceModal from "@/components/modals/print-invoice-modal";
import { fetchCreditById } from "@/lib/actions/credit";
import DeleteCreditModal from "@/components/modals/delete-credit";
import PaymentModal from "@/components/modals/payment";
import PaymentInterestModal from "@/components/modals/payment-interest";
import PaymentFullModal from "@/components/modals/payment-full";
import ViewPaymentsModal from "@/components/modals/view-payments";

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
					aria-label="Select all"
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					aria-label="Select row"
				/>
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "startDate",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="flex items-center gap-1"
					>
						Fecha
						{column.getIsSorted() === "asc"
							? " ↑"
							: column.getIsSorted() === "desc"
							? " ↓"
							: ""}
					</Button>
				);
			},
			cell: ({ row }) => {
				const date = format(new Date(row.getValue("startDate")), "dd/MM/yyyy");

				return <span className="text-sm font-medium whitespace-nowrap">{date}</span>;
			},
			maxSize: 10,
		},
		{
			accessorKey: "nextPaymentDate",
			header: "Fecha de Pago",
			cell: ({ row }) => {
				const nextPaymentDate = row.getValue("nextPaymentDate");
				if (!nextPaymentDate) return <span className="text-sm font-medium">-</span>;

				const date = format(new Date(nextPaymentDate as number), "dd/MM/yyyy");
				return <span className="text-sm font-bold text-red-500 whitespace-nowrap">{date}</span>;
			},
			maxSize: 10,
		},
		{
			accessorKey: "clientCardId",
			header: "Cédula",
		},
		{
			accessorKey: "clientName",
			header: "Nombre",
		},
		{
			accessorKey: "clientPhone",
			header: "Teléfono",
		},
		{
			accessorKey: "productName",
			header: "Producto",
		},
		{
			accessorKey: "initialAmount",
			header: "Monto Inicial",
			cell: ({ row }) => {
				const formatted = new Intl.NumberFormat("es-CO", {
					style: "currency",
					currency: "COP",
				}).format(row.getValue("initialAmount"));

				return <span className="text-sm font-medium">{formatted}</span>;
			},
		},
		{
			accessorKey: "interestRate",
			header: "Tasa",
			cell: ({ row }) => {
				return <span className="text-sm font-medium">{row.getValue("interestRate")}%</span>;
			},
		},
		{
			accessorKey: "interestAmount",
			header: "Monto de Interés",
			cell: ({ row }) => {
				const interestAmount = Number(row.getValue("interestAmount"));
				if (!interestAmount) return <span className="text-sm font-medium">-</span>;
				const formatted = new Intl.NumberFormat("es-CO", {
					style: "currency",
					currency: "COP",
				}).format(interestAmount);
				return <span className="text-sm font-medium">{formatted}</span>;
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
				const formatted = new Intl.NumberFormat("es-CO", {
					style: "currency",
					currency: "COP",
				}).format(totalAmount + interestAmount);

				return <span className="text-sm font-medium">{formatted}</span>;
			},
		},
		{
			id: "diasAtraso",
			header: "Días de Atraso",
			cell: ({ row }) => {
				const nextPaymentDate = row.original.nextPaymentDate;
				if (!nextPaymentDate) return <span className="text-sm font-medium">-</span>;
				const days = Math.floor(
					(Date.now() - new Date(nextPaymentDate as string | number | Date).getTime()) /
						(1000 * 60 * 60 * 24)
				);
				return (
					<span className="text-sm font-bold text-red-500">{days} días</span>
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
							<Button variant="ghost" className="h-8 w-8 p-0">
								<span className="sr-only">Open menu</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>Acciones</DropdownMenuLabel>
							<DropdownMenuItem
								onClick={() => onEditCredit(credit.id as number)}
								className="text-blue-500 cursor-pointer"
							>
								<Pencil className="mr-2 h-4 w-4" />
								Editar
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onPrintInvoice(credit)}
								className="text-purple-500 cursor-pointer"
							>
								<Printer className="mr-2 h-4 w-4" />
								Imprimir factura
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onPayCredit(credit)}
								className="text-green-500 cursor-pointer"
							>
								<CircleDollarSign className="mr-2 h-4 w-4" />
								Pagar Capital
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onPayInterest(credit)}
								className="text-green-500 cursor-pointer"
							>
								<CircleDollarSign className="mr-2 h-4 w-4" />
								Pagar Interés
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onPayFull(credit)}
								className="text-green-500 cursor-pointer"
							>
								<CircleDollarSign className="mr-2 h-4 w-4" />
								Pagar Completo
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onViewPayments(credit)}
								className="text-blue-500 cursor-pointer"
							>
								<History className="mr-2 h-4 w-4" />
								Ver Pagos
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onDeleteCredit(credit.id as number)}
								className="text-red-500 cursor-pointer"
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
		if (!openEditCreditModal) {
			setCreditToEdit(null);
		}
	}, [openEditCreditModal]);

	useEffect(() => {
		if (!openDeleteCreditModal) {
			setCreditToDelete(null);
		}
	}, [openDeleteCreditModal]);

	useEffect(() => {
		if (!openPaymentModal) {
			setCreditToPay(null);
		}
	}, [openPaymentModal]);

	useEffect(() => {
		if (!openPaymentInterestModal) {
			setCreditToPayInterest(null);
		}
	}, [openPaymentInterestModal]);

	useEffect(() => {
		if (!openPaymentFullModal) {
			setCreditToPayFull(null);
		}
	}, [openPaymentFullModal]);

	useEffect(() => {
		if (!openViewPaymentsModal) {
			setCreditToViewPayments(null);
		}
	}, [openViewPaymentsModal]);

	useEffect(() => {
		if (!openPrintInvoiceModal) {
			setCreditToPrint(null);
		}
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
		state: {
			columnVisibility,
			globalFilter,
			sorting,
		},
		onGlobalFilterChange: setGlobalFilter,
	});

	// Calculate totals for all data
	const totals = useMemo(() => {
		const initialAmountTotal = data.reduce((sum, credit) => {
			return sum + (Number(credit.initialAmount) ?? 0);
		}, 0);

		const totalAmountTotal = data.reduce((sum, credit) => {
			const totalAmount = Number(credit.totalAmount) ?? 0;
			const interestAmount = credit.interestAmount ? Number(credit.interestAmount) : 0;
			const total = interestAmount ? totalAmount + interestAmount : totalAmount;
			return sum + total;
		}, 0);

		return {
			initialAmount: initialAmountTotal,
			totalAmount: totalAmountTotal,
		};
	}, [data]);

	return (
		<div className="space-y-4">
			<div className="flex items-center py-4">
				<Input
					placeholder="Buscar..."
					value={(globalFilter as string) ?? ""}
					onChange={(event) => table.setGlobalFilter(event.target.value)}
					className="max-w-sm"
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

			{/* Summary Section */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-muted/30 rounded-lg border">
				<div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border">
					<h3 className="text-sm font-medium text-muted-foreground mb-1">
						Total Monto Inicial
					</h3>
					<p className="text-2xl font-bold text-blue-600">
						{new Intl.NumberFormat("es-CO", {
							style: "currency",
							currency: "COP",
						}).format(totals.initialAmount)}
					</p>
				</div>
				<div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border">
					<h3 className="text-sm font-medium text-muted-foreground mb-1">
						Total Monto Restante
					</h3>
					<p className="text-2xl font-bold text-red-600">
						{new Intl.NumberFormat("es-CO", {
							style: "currency",
							currency: "COP",
						}).format(totals.totalAmount)}
					</p>
				</div>
			</div>

			<div className="rounded-md border">
				<DataTable table={table} />
			</div>
			<DataTablePagination table={table} />
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

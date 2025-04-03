"use client";

import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
// import { columns } from "./columns";
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
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import EditCreditModal from "@/components/modals/edit-credit";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { CircleDollarSign, History, MoreHorizontal, Pencil, Trash } from "lucide-react";
import { fetchCreditById } from "@/lib/actions/credit";
import DeleteCreditModal from "@/components/modals/delete-credit";
import PaymentModal from "@/components/modals/payment";
import ViewPaymentsModal from "@/components/modals/view-payments";
import PaymentInterestModal from "@/components/modals/payment-interest";
import PaymentFullModal from "@/components/modals/payment-full";
import { cn } from "@/lib/utils";

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

				return <span className="w-3 text-sm font-medium">{date}</span>;
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
			header: "Teléfono",
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
				const amount = row.getValue("interestAmount")
					? Number(row.getValue("interestAmount"))
					: 0;

				const formatted = new Intl.NumberFormat("es-CO", {
					style: "currency",
					currency: "COP",
				}).format(amount);

				return <span className="text-sm font-medium">{amount ? formatted : ""}</span>;
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

				const total = interestAmount ? totalAmount + interestAmount : totalAmount;

				const formatted = new Intl.NumberFormat("es-CO", {
					style: "currency",
					currency: "COP",
				}).format(total);

				return <span className="text-sm font-medium">{formatted}</span>;
			},
		},
		{
			accessorKey: "nextPaymentDate",
			header: "Próximo Pago",
			cell: ({ row }) => {
				const nextPaymentDate = row.getValue("nextPaymentDate");

				if (!nextPaymentDate) {
					return <span className="text-sm font-medium">No establecido</span>;
				}

				const paymentDate = new Date(nextPaymentDate as string | number);
				const currentDate = new Date();

				// Remove time part for date comparison
				currentDate.setHours(0, 0, 0, 0);

				const isOverdue = paymentDate < currentDate;

				return (
					<span
						className={cn(
							"text-sm font-bold",
							isOverdue ? "text-red-600" : "text-green-600"
						)}
					>
						{format(paymentDate, "dd/MM/yyyy")}
					</span>
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
								onClick={() => onViewPayments(credit)}
								className="cursor-pointer text-gray-700"
							>
								<History className="mr-2 h-4 w-4" />
								Ver pagos
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onPayCredit(credit, "CAPITAL")}
								className="cursor-pointer text-green-700"
							>
								<CircleDollarSign className="mr-2 h-4 w-4" />
								Abonar a capital
							</DropdownMenuItem>
							{credit.interestAmount && Number(credit.interestAmount) > 0 && (
								<DropdownMenuItem
									onClick={() => onPayCredit(credit, "INTEREST")}
									className="cursor-pointer text-emerald-600"
								>
									<CircleDollarSign className="mr-2 h-4 w-4" />
									Abonar interés
								</DropdownMenuItem>
							)}
							<DropdownMenuItem
								onClick={() => onPayFull(credit)}
								className="cursor-pointer text-green-800"
							>
								<CircleDollarSign className="mr-2 h-4 w-4" />
								Pagar completo
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onEditCredit(credit.id)}
								className="text-blue-600 cursor-pointer"
							>
								<Pencil className="mr-2 h-4 w-4" />
								Editar
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onDeleteCredit(credit.id)}
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

	const onPayFull = (credit: Credit) => {
		setCreditToPayFull(credit);
		setOpenPaymentFullModal(true);
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
		if (!openViewPaymentsModal) {
			setCreditToViewPayments(null);
		}
	}, [openViewPaymentsModal]);

	useEffect(() => {
		if (!openPaymentFullModal) {
			setCreditToPayFull(null);
		}
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
		state: {
			columnVisibility,
			globalFilter,
			sorting,
		},
		onGlobalFilterChange: setGlobalFilter,
	});

	return (
		<div>
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
		</div>
	);
}

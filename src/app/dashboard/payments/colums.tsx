import { Checkbox } from "@/components/ui/checkbox";
import { Payment } from "@/types/schema";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

export const columns: ColumnDef<Payment>[] = [
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
		accessorKey: "paymentDate",
		header: "Fecha de pago",
		cell: ({ row }) => {
			const date = format(new Date(row.getValue("paymentDate")), "dd/MM/yyyy");

			return <span className="w-3 text-sm font-medium">{date}</span>;
		},
		maxSize: 10,
	},
	{
		accessorKey: "clientId",
		header: "Cédula del cliente",
	},
	{
		accessorKey: "clientName",
		header: "Nombre del cliente",
	},
	{
		accessorKey: "creditName",
		header: "Nombre del crédito",
	},
	{
		accessorKey: "amountPaid",
		header: "Monto abonado",
		cell: ({ row }) => {
			const formatted = new Intl.NumberFormat("es-CO", {
				style: "currency",
				currency: "COP",
			}).format(row.getValue("amountPaid"));

			return <span className="text-sm font-medium">{formatted}</span>;
		},
	},
];

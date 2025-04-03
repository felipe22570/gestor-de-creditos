import { Checkbox } from "@/components/ui/checkbox";
import { Payment } from "@/types/schema";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deletePayment } from "@/lib/actions/payment";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Create a separate component for the delete action
function DeletePaymentButton({ paymentId }: { paymentId: number }) {
	const [isDeleting, setIsDeleting] = useState(false);
	const { toast } = useToast();

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			const result = await deletePayment(paymentId);

			if (result.success) {
				toast({
					title: "Pago eliminado",
					description: "El pago ha sido eliminado exitosamente.",
					variant: "default",
				});
				// Refresh the page to update the table
				window.location.reload();
			} else {
				toast({
					title: "Error",
					description: result.message || "No se pudo eliminar el pago.",
					variant: "destructive",
				});
			}
		} catch (error: unknown) {
			toast({
				title: "Error",
				description: "Ocurrió un error al eliminar el pago.",
				variant: "destructive",
			});
			console.error(error);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="ghost" size="icon" className="h-8 w-8">
					<Trash2 className="h-4 w-4 text-destructive" />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
					<AlertDialogDescription>
						Esta acción eliminará el pago y es irreversible. Si es un pago de capital, se
						restaurará el monto correspondiente al crédito.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						onClick={(e) => {
							e.preventDefault();
							handleDelete();
						}}
						disabled={isDeleting}
					>
						{isDeleting ? "Eliminando..." : "Eliminar pago"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

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
		accessorKey: "startDate",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="flex items-center gap-1"
				>
					Fecha de pago
					{column.getIsSorted() === "asc" ? " ↑" : column.getIsSorted() === "desc" ? " ↓" : ""}
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
	{
		accessorKey: "paymentType",
		header: "Tipo de pago",
		cell: ({ row }) => {
			const paymentType = row.getValue("paymentType");
			const paymentTypes = {
				CAPITAL: "Capital",
				INTEREST: "Interés",
			};

			return (
				<span className="text-sm font-medium">
					{paymentTypes[paymentType as keyof typeof paymentTypes] ?? "Capital"}
				</span>
			);
		},
	},
	{
		id: "actions",
		header: "Acciones",
		cell: ({ row }) => {
			const payment = row.original;
			return <DeletePaymentButton paymentId={payment.id} />;
		},
	},
];

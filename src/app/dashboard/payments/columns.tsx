"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Chip } from "@/components/ui/chip";
import { useToast } from "@/hooks/use-toast";
import { deletePayment } from "@/lib/actions/payment";
import { formatCOP } from "@/lib/utils";
import { Payment } from "@/types/schema";

function DeletePaymentButton({ paymentId }: { paymentId: number }) {
	const [isDeleting, setIsDeleting] = useState(false);
	const { toast } = useToast();
	const router = useRouter();

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
				router.refresh();
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
					<span className="sr-only">Eliminar pago</span>
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

const paymentTypeMeta: Record<string, { label: string; variant: "active" | "warning" | "success" }> = {
	CAPITAL: { label: "Capital", variant: "active" },
	INTEREST: { label: "Interés", variant: "warning" },
	FULL: { label: "Pago Completo", variant: "success" },
};

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
				Fecha de pago
				{column.getIsSorted() === "asc" ? " ↑" : column.getIsSorted() === "desc" ? " ↓" : ""}
			</Button>
		),
		cell: ({ row }) => (
			<span className="whitespace-nowrap font-mono text-small tabular-nums text-foreground">
				{format(new Date(row.getValue("startDate")), "dd/MM/yyyy")}
			</span>
		),
	},
	{ accessorKey: "clientId", header: "Cédula del cliente" },
	{ accessorKey: "clientName", header: "Nombre del cliente" },
	{ accessorKey: "creditName", header: "Nombre del crédito" },
	{
		accessorKey: "amountPaid",
		header: "Monto abonado",
		cell: ({ row }) => (
			<span className="font-mono text-small font-semibold tabular-nums text-foreground">
				{formatCOP(Number(row.getValue("amountPaid")))}
			</span>
		),
	},
	{
		accessorKey: "paymentType",
		header: "Tipo de pago",
		cell: ({ row }) => {
			const paymentType = String(row.getValue("paymentType") ?? "");
			const meta = paymentTypeMeta[paymentType];

			if (!meta) {
				return (
					<Chip variant="default" size="sm">
						Desconocido
					</Chip>
				);
			}

			return (
				<Chip variant={meta.variant} size="sm">
					{meta.label}
				</Chip>
			);
		},
	},
	{
		id: "actions",
		header: "Acciones",
		cell: ({ row }) => <DeletePaymentButton paymentId={row.original.id} />,
	},
];

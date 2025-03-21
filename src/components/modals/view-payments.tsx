"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Credit, Payment } from "@/types/schema";
import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { deletePayment, fetchPaymentsByCreditId } from "@/lib/actions/payment";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCOP } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useToast } from "@/hooks/use-toast";

interface Props {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	credit: Credit | null;
}

const paymentTypes = {
	CAPITAL: "Capital",
	INTEREST: "Interés",
};

// Component for delete button
function DeletePaymentButton({
	paymentId,
	onDeleteSuccess,
}: {
	paymentId: number;
	onDeleteSuccess: () => void;
}) {
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
				onDeleteSuccess();
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

export default function ViewPaymentsModal({ isOpen, setIsOpen, credit }: Props) {
	const [payments, setPayments] = useState<Payment[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const loadPayments = useCallback(async () => {
		setIsLoading(true);
		try {
			if (credit) {
				const creditPayments = await fetchPaymentsByCreditId(credit.id);
				setPayments(creditPayments || []);
			}
		} finally {
			setIsLoading(false);
		}
	}, [credit]);

	useEffect(() => {
		if (isOpen) {
			loadPayments();
		}
	}, [isOpen, loadPayments]);

	const handleDeleteSuccess = () => {
		// Reload payments after successful deletion
		loadPayments();
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className="max-w-3xl">
				<DialogHeader>
					<DialogTitle>Historial de Pagos - {credit?.productName}</DialogTitle>
				</DialogHeader>
				<div className="mt-4">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Fecha</TableHead>
								<TableHead>Monto</TableHead>
								<TableHead>Cliente</TableHead>
								<TableHead>Cédula</TableHead>
								<TableHead>Tipo</TableHead>
								<TableHead>Acciones</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								<>
									{[...Array(3)].map((_, index) => (
										<TableRow key={index}>
											<TableCell>
												<Skeleton className="h-4 w-24" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-32" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-40" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-24" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-20" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-10" />
											</TableCell>
										</TableRow>
									))}
								</>
							) : (
								<>
									{payments.map((payment) => (
										<TableRow key={`${payment.id}-${payment.startDate}`}>
											<TableCell>
												{format(
													payment.startDate ?? new Date(),
													"dd/MM/yyyy"
												)}
											</TableCell>
											<TableCell>
												{formatCOP(payment.amountPaid ?? 0)}
											</TableCell>
											<TableCell>{payment.clientName}</TableCell>
											<TableCell>{payment.clientId}</TableCell>
											<TableCell>
												{paymentTypes[
													payment.paymentType as keyof typeof paymentTypes
												] ?? "Capital"}
											</TableCell>
											<TableCell>
												<DeletePaymentButton
													paymentId={payment.id}
													onDeleteSuccess={handleDeleteSuccess}
												/>
											</TableCell>
										</TableRow>
									))}
									{payments.length === 0 && (
										<TableRow>
											<TableCell colSpan={6} className="text-center">
												No hay pagos registrados
											</TableCell>
										</TableRow>
									)}
								</>
							)}
						</TableBody>
					</Table>
				</div>
			</DialogContent>
		</Dialog>
	);
}

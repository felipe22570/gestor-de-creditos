"use client";

import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

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
import { Chip } from "@/components/ui/chip";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { deletePayment, fetchPaymentsByCreditId } from "@/lib/actions/payment";
import { formatCOP } from "@/lib/utils";
import { Credit, Payment } from "@/types/schema";

interface Props {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	credit: Credit | null;
}

const paymentTypeMeta: Record<string, { label: string; variant: "active" | "warning" | "success" }> = {
	CAPITAL: { label: "Capital", variant: "active" },
	INTEREST: { label: "Interés", variant: "warning" },
	FULL: { label: "Pago Completo", variant: "success" },
};

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
		loadPayments();
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className="max-w-3xl">
				<DialogHeader>
					<DialogTitle>Historial de pagos</DialogTitle>
					<DialogDescription>
						{credit?.productName ?? "Crédito"} ·{" "}
						<span className="text-foreground">{credit?.clientName}</span>
					</DialogDescription>
				</DialogHeader>

				<div className="overflow-hidden rounded-card border border-border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Fecha</TableHead>
								<TableHead>Monto</TableHead>
								<TableHead>Cliente</TableHead>
								<TableHead>Cédula</TableHead>
								<TableHead>Tipo</TableHead>
								<TableHead className="text-right">Acciones</TableHead>
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
												<Skeleton className="ml-auto h-4 w-10" />
											</TableCell>
										</TableRow>
									))}
								</>
							) : payments.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={6}
										className="h-24 text-center text-text-secondary"
									>
										No hay pagos registrados
									</TableCell>
								</TableRow>
							) : (
								payments.map((payment) => {
									const meta =
										paymentTypeMeta[payment.paymentType ?? ""] ?? null;

									return (
										<TableRow key={`${payment.id}-${payment.startDate}`}>
											<TableCell className="whitespace-nowrap font-mono text-small tabular-nums">
												{format(payment.startDate ?? new Date(), "dd/MM/yyyy")}
											</TableCell>
											<TableCell className="font-mono text-small font-semibold tabular-nums">
												{formatCOP(payment.amountPaid ?? 0)}
											</TableCell>
											<TableCell>{payment.clientName}</TableCell>
											<TableCell>{payment.clientId}</TableCell>
											<TableCell>
												{meta ? (
													<Chip variant={meta.variant} size="sm">
														{meta.label}
													</Chip>
												) : (
													<Chip variant="default" size="sm">
														Desconocido
													</Chip>
												)}
											</TableCell>
											<TableCell className="text-right">
												<DeletePaymentButton
													paymentId={payment.id}
													onDeleteSuccess={handleDeleteSuccess}
												/>
											</TableCell>
										</TableRow>
									);
								})
							)}
						</TableBody>
					</Table>
				</div>
			</DialogContent>
		</Dialog>
	);
}

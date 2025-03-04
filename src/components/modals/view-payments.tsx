"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Credit, Payment } from "@/types/schema";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fetchPaymentsByCreditId } from "@/lib/actions/payment";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCOP } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	credit: Credit | null;
}

const paymentTypes = {
	CAPITAL: "Capital",
	INTEREST: "Interés",
};

export default function ViewPaymentsModal({ isOpen, setIsOpen, credit }: Props) {
	const [payments, setPayments] = useState<Payment[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const loadPayments = async () => {
			setIsLoading(true);
			try {
				if (credit) {
					const creditPayments = await fetchPaymentsByCreditId(credit.id);
					setPayments(creditPayments || []);
				}
			} finally {
				setIsLoading(false);
			}
		};

		if (isOpen) {
			loadPayments();
		}
	}, [isOpen, credit]);

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
										</TableRow>
									))}
									{payments.length === 0 && (
										<TableRow>
											<TableCell colSpan={4} className="text-center">
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

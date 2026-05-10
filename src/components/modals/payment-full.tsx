"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { createFullPayment } from "@/lib/actions/payment";
import { formatCOP } from "@/lib/utils";
import { Credit } from "@/types/schema";

interface Props {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	credit: Credit | null;
}

export default function PaymentFullModal({ isOpen, setIsOpen, credit }: Props) {
	const { toast } = useToast();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const totalAmount = credit ? credit.totalAmount + (credit.interestAmount || 0) : 0;

	useEffect(() => {
		if (!isOpen) setIsLoading(false);
	}, [isOpen]);

	const onPayFull = async () => {
		setIsLoading(true);
		try {
			await createFullPayment(credit as Credit);

			toast({
				title: "Pago completo realizado exitosamente",
				variant: "success",
				duration: 1500,
			});
			setIsOpen(false);
			router.refresh();
		} catch (error) {
			console.error(error);

			toast({
				title: error instanceof Error ? error.message : "Error al realizar el pago",
				variant: "destructive",
				duration: 2000,
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Pagar crédito completo</AlertDialogTitle>
					<AlertDialogDescription>
						Vas a saldar el crédito de{" "}
						<span className="font-semibold text-foreground">{credit?.productName}</span> en su
						totalidad. Esta acción marcará el crédito como completado.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<div className="rounded-panel bg-muted px-4 py-3">
					<p className="text-overline uppercase font-semibold text-text-secondary">
						Monto total a pagar
					</p>
					<p className="font-mono text-subhead font-semibold tabular-nums text-success">
						{formatCOP(totalAmount)}
					</p>
				</div>

				<AlertDialogFooter>
					<AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
					<AlertDialogAction onClick={onPayFull} disabled={isLoading}>
						{isLoading ? "Procesando..." : "Pagar completo"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

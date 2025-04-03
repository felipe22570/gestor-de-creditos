"use client";

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
import { formatCOP } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Credit } from "@/types/schema";
import { createFullPayment } from "@/lib/actions/payment";

interface Props {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	credit: Credit | null;
}

export default function PaymentFullModal({ isOpen, setIsOpen, credit }: Props) {
	const { toast } = useToast();
	const router = useRouter();

	const totalAmount = credit ? credit.totalAmount + (credit.interestAmount || 0) : 0;

	const onPayFull = async () => {
		try {
			await createFullPayment(credit as Credit);

			toast({
				title: "Pago completo realizado exitosamente!",
				variant: "success",
				duration: 1500,
			});
		} catch (error) {
			console.error(error);

			toast({
				title: "Error al realizar el pago",
				variant: "destructive",
				duration: 1500,
			});
		} finally {
			setIsOpen(false);
			router.refresh();
		}
	};

	return (
		<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Pagar crédito completo</AlertDialogTitle>
					<AlertDialogDescription>
						<span>
							Estás seguro de que deseas pagar el crédito completo de{" "}
							<i>{credit?.productName}</i> por valor de <b>{formatCOP(totalAmount)}</b>?
						</span>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction className="bg-green-500 focus:bg-green-600" onClick={onPayFull}>
						Pagar completo
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

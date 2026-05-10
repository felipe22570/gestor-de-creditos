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
import { createInterestPayment } from "@/lib/actions/payment";
import { formatCOP } from "@/lib/utils";
import { Credit } from "@/types/schema";

import { Checkbox } from "../ui/checkbox";

interface Props {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	credit: Credit | null;
}

export default function PaymentInterestModal({ isOpen, setIsOpen, credit }: Props) {
	const { toast } = useToast();
	const router = useRouter();

	const [addNewInterest, setAddNewInterest] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const interestAmount = credit?.interestAmount ?? 0;

	useEffect(() => {
		if (!isOpen) {
			setAddNewInterest(false);
			setIsLoading(false);
		}
	}, [isOpen]);

	const onAddInterest = async () => {
		setIsLoading(true);
		try {
			await createInterestPayment(credit as Credit, interestAmount, addNewInterest);

			toast({
				variant: "success",
				title: "Interés abonado exitosamente",
				description: "El interés ha sido abonado correctamente",
			});

			setIsOpen(false);
			router.refresh();
		} catch (error) {
			console.error(error);

			toast({
				variant: "destructive",
				title: "Error al abonar interés",
				description: error instanceof Error ? error.message : "Error desconocido",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Abonar interés</AlertDialogTitle>
					<AlertDialogDescription>
						Vas a abonar el interés acumulado de{" "}
						<span className="font-semibold text-foreground">{credit?.productName}</span>.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<div className="space-y-4">
					<div className="rounded-panel bg-muted px-4 py-3">
						<p className="text-overline uppercase font-semibold text-text-secondary">
							Monto a abonar
						</p>
						<p className="font-mono text-subhead font-semibold tabular-nums text-primary">
							{formatCOP(interestAmount)}
						</p>
					</div>

					<label
						htmlFor="interest"
						className="flex items-start gap-3 rounded-md border border-border p-3 transition-colors hover:bg-muted"
					>
						<Checkbox
							id="interest"
							checked={addNewInterest}
							onCheckedChange={(value) => setAddNewInterest(Boolean(value))}
							className="mt-0.5"
						/>
						<span>
							<span className="block text-small font-medium text-foreground">
								Agregar interés del próximo mes
							</span>
							<span className="block text-caption text-text-secondary">
								Se calculará un nuevo monto de interés sobre el capital pendiente.
							</span>
						</span>
					</label>
				</div>

				<AlertDialogFooter>
					<AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
					<AlertDialogAction onClick={onAddInterest} disabled={isLoading}>
						{isLoading ? "Abonando..." : "Abonar"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

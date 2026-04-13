"use client";

import { Credit } from "@/types/schema";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { useState } from "react";
import { Input } from "../ui/input";
import { formatCOP } from "@/lib/utils";
import { Button } from "../ui/button";
import { createCapitalPayment } from "@/lib/actions/payment";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface Props {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	credit: Credit | null;
}

export default function PaymentModal({ isOpen, setIsOpen, credit }: Props) {
	const { toast } = useToast();
	const router = useRouter();

	const [amount, setAmount] = useState<number | string>("");
	const [totalResidual, setTotalResidual] = useState<number>(credit?.totalAmount as number);

	const onChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
		setAmount(Number(e.target.value));

		if (credit) {
			setTotalResidual(credit.totalAmount - Number(e.target.value));
		}
	};

	const onAddPayment = async () => {
		const numAmount = Number(amount);
		// Validate input before submitting
		if (Number.isNaN(numAmount) || numAmount <= 0) {
			toast({
				title: "Ingrese un monto válido mayor que cero",
				variant: "destructive",
				duration: 2000,
			});
			return;
		}

		if (numAmount > (credit?.totalAmount ?? 0)) {
			toast({
				title: "El monto no puede ser mayor que el total adeudado",
				variant: "destructive",
				duration: 2000,
			});
			return;
		}

		try {
			await createCapitalPayment(credit as Credit, numAmount);

			toast({
				title: "Abono realizado exitosamente!",
				variant: "success",
				duration: 1500,
			});
		} catch (error) {
			console.error(error);

			toast({
				title: error instanceof Error ? error.message : "Error al abonar",
				variant: "destructive",
				duration: 2000,
			});
		} finally {
			setIsOpen(false);
			router.refresh();
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Realizar pago a capital</DialogTitle>
					<DialogDescription className="sr-only">
						Ingresa el valor a abonar al capital del crédito.
					</DialogDescription>
				</DialogHeader>
				<div className="h-full">
					<div className="">
						<Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
							Valor a abonar:
						</Label>
						<Input
							type="number"
							min="1"
							max={credit?.totalAmount}
							step="1"
							className="mt-1 col-span-3"
							name="amount"
							value={amount}
							onChange={onChangeAmount}
						/>
					</div>

					<span className="text-sm font-medium text-gray-500">
						Total residual: {formatCOP(totalResidual)}
					</span>
				</div>
				<DialogFooter>
					<Button type="submit" onClick={onAddPayment}>
						Abonar
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

"use client";

import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useToast } from "@/hooks/use-toast";
import { createCapitalPayment } from "@/lib/actions/payment";
import { formatCOP } from "@/lib/utils";
import { Credit } from "@/types/schema";

import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface Props {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	credit: Credit | null;
}

export default function PaymentModal({ isOpen, setIsOpen, credit }: Props) {
	const { toast } = useToast();
	const router = useRouter();

	const [amount, setAmount] = useState<number | string>("");
	const [isLoading, setIsLoading] = useState(false);
	const totalAmount = credit?.totalAmount ?? 0;
	const totalResidual = totalAmount - (Number(amount) || 0);

	useEffect(() => {
		if (!isOpen) {
			setAmount("");
			setIsLoading(false);
		}
	}, [isOpen]);

	const onAddPayment = async () => {
		const numAmount = Number(amount);
		if (Number.isNaN(numAmount) || numAmount <= 0) {
			toast({
				title: "Ingrese un monto válido mayor que cero",
				variant: "destructive",
				duration: 2000,
			});
			return;
		}

		if (numAmount > totalAmount) {
			toast({
				title: "El monto no puede ser mayor que el total adeudado",
				variant: "destructive",
				duration: 2000,
			});
			return;
		}

		setIsLoading(true);
		try {
			await createCapitalPayment(credit as Credit, numAmount);

			toast({
				title: "Abono realizado exitosamente",
				variant: "success",
				duration: 1500,
			});
			setIsOpen(false);
			router.refresh();
		} catch (error) {
			console.error(error);

			toast({
				title: error instanceof Error ? error.message : "Error al abonar",
				variant: "destructive",
				duration: 2000,
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Realizar pago a capital</DialogTitle>
					<DialogDescription>
						Ingresa el valor a abonar al capital del crédito.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="grid grid-cols-2 gap-3 rounded-panel bg-muted px-4 py-3">
						<div className="space-y-0.5">
							<p className="text-overline uppercase font-semibold text-text-secondary">
								Total adeudado
							</p>
							<p className="font-mono text-small font-medium tabular-nums text-foreground">
								{formatCOP(totalAmount)}
							</p>
						</div>
						<div className="space-y-0.5">
							<p className="text-overline uppercase font-semibold text-text-secondary">
								Saldo después del abono
							</p>
							<p className="font-mono text-small font-semibold tabular-nums text-primary">
								{formatCOP(Math.max(0, totalResidual))}
							</p>
						</div>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="amount">Valor a abonar</Label>
						<Input
							id="amount"
							type="number"
							min="1"
							max={totalAmount}
							step="1"
							name="amount"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							disabled={isLoading}
							autoFocus
						/>
					</div>
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="ghost"
						onClick={() => setIsOpen(false)}
						disabled={isLoading}
					>
						Cancelar
					</Button>
					<Button type="button" onClick={onAddPayment} disabled={isLoading}>
						{isLoading ? (
							<>
								<Loader2Icon className="mr-1 h-4 w-4 animate-spin" />
								Abonando...
							</>
						) : (
							"Abonar"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

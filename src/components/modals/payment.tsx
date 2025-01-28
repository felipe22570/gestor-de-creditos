"use client";

import { Credit } from "@/types/schema";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { useState } from "react";
import { Input } from "../ui/input";
import { formatCOP } from "@/lib/utils";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { createPayment } from "@/lib/actions/payment";
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
	const [addInterest, setAddInterest] = useState<boolean>(false);

	const onChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
		setAmount(Number(e.target.value));

		if (credit) {
			setTotalResidual(credit.totalAmount - Number(e.target.value));
		}
	};

	const onAddInterest = (value: boolean) => {
		setAddInterest(value);
	};

	const onAddPayment = async () => {
		const interestValue = (Number(totalResidual) * Number(credit?.interestRate)) / 100;
		let totalValue = totalResidual;

		if (addInterest) {
			totalValue = Number(totalResidual) + interestValue;
		}

		try {
			await createPayment(credit as Credit, Number(totalValue));

			toast({
				title: "Abono realizado exitosamente!",
				variant: "success",
				duration: 1500,
			});
		} catch (error) {
			console.error(error);

			toast({
				title: "Error al abonar",
				variant: "destructive",
				duration: 1500,
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
					<DialogTitle>Realizar pago</DialogTitle>
				</DialogHeader>
				<div className="h-full">
					<div className="">
						<Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
							Valor a abonar:
						</Label>
						<Input
							className="mt-1 col-span-3"
							name="amount"
							value={amount}
							onChange={onChangeAmount}
						/>
					</div>

					<div className="flex items-center space-x-2 mt-4 mb-7">
						<Checkbox id="interest" checked={addInterest} onCheckedChange={onAddInterest} />
						<label
							htmlFor="interest"
							className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							Aplicar porcentaje de interés ({credit?.interestRate}%)
						</label>
					</div>

					<span className="text-sm font-medium text-gray-500">
						Total residual:{" "}
						{addInterest
							? formatCOP(
									Number(totalResidual) +
										(Number(totalResidual) * Number(credit?.interestRate)) / 100
							  )
							: formatCOP(totalResidual)}
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

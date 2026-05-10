"use client";

import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { editCredit } from "@/lib/actions/credit";
import { formatCOP, getNextPaymentDate } from "@/lib/utils";
import { CreditRequest } from "@/types/credit";
import { Credit } from "@/types/schema";

import { Button } from "../ui/button";
import { DatePicker } from "../ui/date-picker";

interface Props {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	credit: Credit | null;
}

export default function EditCreditModal({ isOpen, setIsOpen, credit }: Props) {
	const { toast } = useToast();

	const router = useRouter();

	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		clientCardId: credit?.clientCardId || "",
		clientName: credit?.clientName || "",
		clientPhone: credit?.clientPhone || "",
		productName: credit?.productName || "",
		value: credit?.initialAmount || "",
		interestRate: credit?.interestRate || "",
	});

	const [creditDate, setCreditDate] = useState<Date | undefined>(credit?.startDate as Date);
	const [totalAmount, setTotalAmount] = useState(0);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prevFormData) => ({
			...prevFormData,
			[name]: value,
		}));
	};

	useEffect(() => {
		let total = Number(formData.value);

		if (formData.value && formData.interestRate) {
			total =
				Number(formData.value) + (Number(formData.value) * Number(formData.interestRate)) / 100;
		}
		setTotalAmount(total);
	}, [formData.value, formData.interestRate]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		const newCredit: Partial<CreditRequest> = {
			clientCardId: Number(formData.clientCardId),
			clientName: String(formData.clientName),
			clientPhone: String(formData.clientPhone),
			productName: String(formData.productName),
			initialAmount: Number(formData.value),
			interestRate: Number(formData.interestRate),
			totalAmount: Number(formData.value),
			startDate: creditDate,
			nextPaymentDate: creditDate ? getNextPaymentDate(creditDate) : undefined,
		};

		try {
			await editCredit(credit?.id as number, newCredit);

			toast({
				title: "Crédito editado exitosamente",
				variant: "success",
				duration: 1500,
			});
			setIsOpen(false);
			router.refresh();
		} catch (error) {
			console.error(error);

			toast({
				title: "Error al editar el crédito",
				variant: "destructive",
				duration: 1500,
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className="flex max-h-[95vh] flex-col gap-0 p-0 sm:max-w-[520px]">
				<DialogHeader className="shrink-0 border-b border-border px-6 pb-4 pt-6">
					<DialogTitle>Editar Crédito</DialogTitle>
					<DialogDescription>
						Modifica los datos del crédito seleccionado.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
					<div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label htmlFor="clientCardId">Cédula</Label>
								<Input
									id="clientCardId"
									name="clientCardId"
									type="number"
									value={formData.clientCardId}
									onChange={handleInputChange}
									disabled={isLoading}
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="clientPhone">Teléfono</Label>
								<Input
									id="clientPhone"
									name="clientPhone"
									type="tel"
									value={formData.clientPhone}
									onChange={handleInputChange}
									disabled={isLoading}
								/>
							</div>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="clientName">Nombre</Label>
							<Input
								id="clientName"
								name="clientName"
								value={formData.clientName}
								onChange={handleInputChange}
								disabled={isLoading}
							/>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="productName">Nombre del Producto</Label>
							<Textarea
								id="productName"
								name="productName"
								value={formData.productName}
								onChange={handleInputChange}
								disabled={isLoading}
								rows={2}
							/>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label htmlFor="value">Valor</Label>
								<Input
									id="value"
									name="value"
									type="text"
									value={formData.value}
									onChange={handleInputChange}
									disabled={isLoading}
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="interestRate">Porcentaje de interés (%)</Label>
								<Input
									id="interestRate"
									name="interestRate"
									type="number"
									value={formData.interestRate}
									onChange={handleInputChange}
									disabled={isLoading}
								/>
							</div>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="creditDate">Fecha</Label>
							<DatePicker value={creditDate} onChange={setCreditDate} />
						</div>

						<div className="rounded-panel bg-muted px-4 py-3">
							<p className="text-overline uppercase font-semibold text-text-secondary">
								Valor Total
							</p>
							<p className="font-mono text-subhead font-semibold tabular-nums text-primary">
								{formatCOP(totalAmount)}
							</p>
						</div>
					</div>

					<DialogFooter className="shrink-0 border-t border-border px-6 py-4">
						<Button
							type="button"
							variant="ghost"
							onClick={() => setIsOpen(false)}
							disabled={isLoading}
						>
							Cancelar
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2Icon className="mr-1 h-4 w-4 animate-spin" />
									Guardando...
								</>
							) : (
								"Guardar cambios"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

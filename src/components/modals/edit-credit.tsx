import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Credit } from "@/types/schema";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { formatCOP } from "@/lib/utils";
import { editCredit } from "@/lib/actions/credit";
import { CreditRequest } from "@/types/credit";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface Props {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	credit: Credit | null;
}

export default function EditCreditModal({ isOpen, setIsOpen, credit }: Props) {
	const { toast } = useToast();

	const router = useRouter();

	const [formData, setFormData] = useState({
		clienCardId: credit?.clientCardId || "",
		clientName: credit?.clientName || "",
		clientPhone: credit?.clientPhone || "",
		productName: credit?.productName || "",
		value: credit?.initialAmount || "",
		interestRate: credit?.interestRate || "",
	});

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

		const newCredit: Partial<CreditRequest> = {
			clientCardId: Number(formData.clienCardId),
			clientName: formData.clientName,
			clientPhone: formData.clientPhone,
			productName: formData.productName,
			initialAmount: Number(formData.value),
			interestRate: Number(formData.interestRate),
			totalAmount: totalAmount,
		};

		try {
			await editCredit(credit?.id as number, newCredit);

			toast({
				title: "Credito editado exitosamente!",
				variant: "success",
				duration: 1500,
			});
		} catch (error) {
			console.error(error);

			toast({
				title: "Error al editar el credito",
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
					<DialogTitle>Editar Credito</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="grid gap-4 py-4">
					<div className="items-center gap-4">
						<Label htmlFor="clienCardId" className="text-right">
							Numero de Cédula
						</Label>
						<Input
							id="clienCardId"
							name="clienCardId"
							type="number"
							className="col-span-3"
							value={formData.clienCardId}
							onChange={handleInputChange}
						/>
					</div>
					<div className="items-center gap-4">
						<Label htmlFor="clientName" className="text-right">
							Nombre
						</Label>
						<Input
							id="clientName"
							name="clientName"
							className="col-span-3"
							value={formData.clientName}
							onChange={handleInputChange}
						/>
					</div>
					<div className="items-center gap-4">
						<Label htmlFor="clientPhone" className="text-right">
							Teléfono
						</Label>
						<Input
							id="clientPhone"
							name="clientPhone"
							type="tel"
							className="col-span-3"
							value={formData.clientPhone}
							onChange={handleInputChange}
						/>
					</div>
					<div className="items-center gap-4">
						<Label htmlFor="productName" className="text-right">
							Nombre del Producto
						</Label>
						<Textarea
							id="productName"
							name="productName"
							className="col-span-3"
							value={formData.productName}
							onChange={handleInputChange}
						/>
					</div>
					<div className="items-center gap-4">
						<Label htmlFor="value" className="text-right">
							Valor
						</Label>
						<Input
							id="value"
							name="value"
							type="text"
							className="col-span-3"
							value={formData.value}
							onChange={handleInputChange}
						/>
					</div>
					<div className="items-center gap-4">
						<Label htmlFor="interestRate" className="text-right">
							Porcentaje de interés
						</Label>
						<Input
							id="interestRate"
							name="interestRate"
							type="number"
							className="col-span-3"
							value={formData.interestRate}
							onChange={handleInputChange}
						/>
					</div>

					<p className="text-sm text-muted-foreground mt-1">
						<span className="text-red-500 mr-1">*</span>
						Valor total: {formatCOP(totalAmount)}
					</p>

					<Button type="submit" className="mt-4">
						Enviar
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}

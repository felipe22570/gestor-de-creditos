"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCredit } from "@/lib/actions/credit";
import { CreditRequest } from "@/types/credit";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { formatCOP } from "@/lib/utils";
import { add } from "date-fns";
import { DatePicker } from "../ui/date-picker";

export default function AddNewCreditModal() {
	const { toast } = useToast();

	const [isOpen, setIsOpen] = useState(false);
	const [formData, setFormData] = useState({
		clienCardId: "",
		clientName: "",
		clientPhone: "",
		productName: "",
		value: "",
		interestRate: "",
	});

	const [creditDate, setCreditDate] = useState<Date | undefined>();

	const session = useSession();
	const router = useRouter();

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

	useEffect(() => {
		if (isOpen) {
			setFormData({
				clienCardId: "",
				clientName: "",
				clientPhone: "",
				productName: "",
				value: "",
				interestRate: "",
			});
		} else {
			router.refresh();
		}
	}, [isOpen, router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const formattedFormData: CreditRequest = {
			startDate: creditDate ?? new Date(),
			clientCardId: Number(formData.clienCardId),
			adminId: Number(session?.data?.user?.id),
			clientName: formData.clientName,
			clientPhone: formData.clientPhone,
			productName: formData.productName,
			initialAmount: Number(formData.value),
			interestRate: Number(formData.interestRate),
			totalAmount: totalAmount,
			numPayments: 0,
			nextPaymentDate: add(creditDate ?? new Date(), { months: 1 }),
		};

		try {
			await createCredit(formattedFormData);

			toast({
				title: "Credito creado exitosamente!",
				variant: "success",
				duration: 1500,
			});
		} catch (error) {
			console.error(error);

			toast({
				title: "Error al crear el credito",
				variant: "destructive",
				duration: 1500,
			});
		} finally {
			setIsOpen(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="default">Agregar Nuevo Crédito</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[525px]">
				<DialogHeader>
					<DialogTitle>Agregar Nuevo Crédito</DialogTitle>
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
							// onBlur={(e) => {
							// 	const formatted = formatCOP(Number(e.target.value));
							// 	setFormData((prev) => ({ ...prev, value: formatted }));
							// }}
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

					<div className=" flex flex-col justify-start gap-4">
						<Label htmlFor="creditDate">Fecha:</Label>
						<DatePicker value={creditDate} onChange={setCreditDate} />
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

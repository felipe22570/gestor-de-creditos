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
import { formatCOP, getNextPaymentDate } from "@/lib/utils";
import { DatePicker } from "../ui/date-picker";

export default function AddNewCreditModal() {
	const { toast } = useToast();

	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		clientCardId: "",
		clientName: "",
		clientPhone: "",
		productName: "",
		value: "",
		interestRate: "",
	});

	const [creditDate, setCreditDate] = useState<Date | undefined>();

	const session = useSession();
	const router = useRouter();

	const [totalWithInterest, setTotalWithInterest] = useState(0);

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
		setTotalWithInterest(total);
	}, [formData.value, formData.interestRate]);

	useEffect(() => {
		if (isOpen) {
			setFormData({
				clientCardId: "",
				clientName: "",
				clientPhone: "",
				productName: "",
				value: "",
				interestRate: "",
			});
			setCreditDate(undefined);
			setIsLoading(false);
		}
	}, [isOpen]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate session
		if (!session?.data?.user?.id) {
			toast({
				title: "Error de autenticación",
				description: "Por favor inicia sesión nuevamente",
				variant: "destructive",
				duration: 3000,
			});
			return;
		}

		// Validate required fields
		if (!formData.clientCardId || !formData.clientName || !formData.clientPhone || 
			!formData.productName || !formData.value || !formData.interestRate) {
			toast({
				title: "Campos requeridos",
				description: "Por favor completa todos los campos",
				variant: "destructive",
				duration: 3000,
			});
			return;
		}

		// Validate numeric values
		const value = Number(formData.value);
		const interestRate = Number(formData.interestRate);
		const clientCardId = Number(formData.clientCardId);

		if (isNaN(value) || value <= 0) {
			toast({
				title: "Valor inválido",
				description: "El valor del crédito debe ser mayor a 0",
				variant: "destructive",
				duration: 3000,
			});
			return;
		}

		if (isNaN(interestRate) || interestRate < 0) {
			toast({
				title: "Tasa de interés inválida",
				description: "La tasa de interés debe ser 0 o mayor",
				variant: "destructive",
				duration: 3000,
			});
			return;
		}

		if (isNaN(clientCardId) || clientCardId <= 0) {
			toast({
				title: "Cédula inválida",
				description: "El número de cédula no es válido",
				variant: "destructive",
				duration: 3000,
			});
			return;
		}

		setIsLoading(true);

		const startDate = creditDate ?? new Date();
		const formattedFormData: CreditRequest = {
			startDate,
			clientCardId,
			adminId: Number(session.data.user.id),
			clientName: formData.clientName.trim(),
			clientPhone: formData.clientPhone.trim(),
			productName: formData.productName.trim(),
			initialAmount: value,
			interestRate,
			interestAmount: Math.floor((value * interestRate) / 100),
			totalAmount: value,
			numPayments: 0,
			nextPaymentDate: getNextPaymentDate(startDate),
		};

		try {
			await createCredit(formattedFormData);

			toast({
				title: "Crédito creado exitosamente!",
				variant: "success",
				duration: 1500,
			});

			router.refresh();
			setIsOpen(false);
		} catch (error) {
			console.error(error);

			toast({
				title: "Error al crear el crédito",
				description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
				variant: "destructive",
				duration: 3000,
			});
		} finally {
			setIsLoading(false);
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
						<Label htmlFor="clientCardId" className="text-right">
							Número de Cédula <span className="text-red-500">*</span>
						</Label>
						<Input
							id="clientCardId"
							name="clientCardId"
							type="number"
							className="col-span-3"
							value={formData.clientCardId}
							onChange={handleInputChange}
							required
							disabled={isLoading}
							min="1"
						/>
					</div>
					<div className="items-center gap-4">
						<Label htmlFor="clientName" className="text-right">
							Nombre <span className="text-red-500">*</span>
						</Label>
						<Input
							id="clientName"
							name="clientName"
							className="col-span-3"
							value={formData.clientName}
							onChange={handleInputChange}
							required
							disabled={isLoading}
						/>
					</div>
					<div className="items-center gap-4">
						<Label htmlFor="clientPhone" className="text-right">
							Teléfono <span className="text-red-500">*</span>
						</Label>
						<Input
							id="clientPhone"
							name="clientPhone"
							type="tel"
							className="col-span-3"
							value={formData.clientPhone}
							onChange={handleInputChange}
							required
							disabled={isLoading}
						/>
					</div>
					<div className="items-center gap-4">
						<Label htmlFor="productName" className="text-right">
							Nombre del Producto <span className="text-red-500">*</span>
						</Label>
						<Textarea
							id="productName"
							name="productName"
							className="col-span-3"
							value={formData.productName}
							onChange={handleInputChange}
							required
							disabled={isLoading}
						/>
					</div>
					<div className="items-center gap-4">
						<Label htmlFor="value" className="text-right">
							Valor del Crédito <span className="text-red-500">*</span>
						</Label>
						<Input
							id="value"
							name="value"
							type="number"
							className="col-span-3"
							value={formData.value}
							onChange={handleInputChange}
							required
							disabled={isLoading}
							min="1"
							step="1"
						/>
					</div>
					<div className="items-center gap-4">
						<Label htmlFor="interestRate" className="text-right">
							Porcentaje de Interés (%) <span className="text-red-500">*</span>
						</Label>
						<Input
							id="interestRate"
							name="interestRate"
							type="number"
							className="col-span-3"
							value={formData.interestRate}
							onChange={handleInputChange}
							required
							disabled={isLoading}
							min="0"
							step="0.01"
						/>
					</div>

					<div className="flex flex-col justify-start gap-2">
						<Label htmlFor="creditDate">
							Fecha de Inicio <span className="text-sm text-muted-foreground">(opcional)</span>
						</Label>
						<DatePicker value={creditDate} onChange={setCreditDate} />
						{!creditDate && (
							<p className="text-xs text-muted-foreground">
								Por defecto se usará la fecha de hoy
							</p>
						)}
					</div>

					<div className="bg-muted p-3 rounded-md space-y-1">
						<p className="text-sm font-medium">
							Capital: {formatCOP(Number(formData.value) || 0)}
						</p>
						<p className="text-sm text-muted-foreground">
							+ Interés mensual: {formatCOP(Math.floor((Number(formData.value) * Number(formData.interestRate)) / 100) || 0)}
						</p>
						<p className="text-sm font-semibold border-t pt-1 mt-1">
							Total con primer interés: {formatCOP(totalWithInterest)}
						</p>
					</div>

					<Button type="submit" className="mt-4" disabled={isLoading}>
						{isLoading ? "Creando..." : "Crear Crédito"}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}

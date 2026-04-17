"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
			<DialogContent className="sm:max-w-[500px] max-h-[95vh] flex flex-col p-0 gap-0">
				<DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
					<DialogTitle>Agregar Nuevo Crédito</DialogTitle>
					<DialogDescription className="sr-only">
						Completa el formulario para registrar un nuevo crédito.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
					<div className="flex-1 overflow-y-auto px-6 py-4 grid gap-3">
						<div className="grid grid-cols-2 gap-3">
							<div className="flex flex-col gap-1.5">
								<Label htmlFor="clientCardId">
									Cédula <span className="text-red-500">*</span>
								</Label>
								<Input
									id="clientCardId"
									name="clientCardId"
									type="number"
									value={formData.clientCardId}
									onChange={handleInputChange}
									required
									disabled={isLoading}
									min="1"
									placeholder="Ej: 1234567890"
								/>
							</div>
							<div className="flex flex-col gap-1.5">
								<Label htmlFor="clientPhone">
									Teléfono <span className="text-red-500">*</span>
								</Label>
								<Input
									id="clientPhone"
									name="clientPhone"
									type="tel"
									value={formData.clientPhone}
									onChange={handleInputChange}
									required
									disabled={isLoading}
									placeholder="Ej: 3001234567"
								/>
							</div>
						</div>

						<div className="flex flex-col gap-1.5">
							<Label htmlFor="clientName">
								Nombre <span className="text-red-500">*</span>
							</Label>
							<Input
								id="clientName"
								name="clientName"
								value={formData.clientName}
								onChange={handleInputChange}
								required
								disabled={isLoading}
								placeholder="Nombre completo del cliente"
							/>
						</div>

						<div className="flex flex-col gap-1.5">
							<Label htmlFor="productName">
								Nombre del Producto <span className="text-red-500">*</span>
							</Label>
							<Input
								id="productName"
								name="productName"
								value={formData.productName}
								onChange={handleInputChange}
								required
								disabled={isLoading}
								placeholder="Descripción del producto o servicio"
							/>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div className="flex flex-col gap-1.5">
								<Label htmlFor="value">
									Valor del Crédito <span className="text-red-500">*</span>
								</Label>
								<Input
									id="value"
									name="value"
									type="number"
									value={formData.value}
									onChange={handleInputChange}
									required
									disabled={isLoading}
									min="1"
									step="1"
									placeholder="0"
								/>
							</div>
							<div className="flex flex-col gap-1.5">
								<Label htmlFor="interestRate">
									Interés (%) <span className="text-red-500">*</span>
								</Label>
								<Input
									id="interestRate"
									name="interestRate"
									type="number"
									value={formData.interestRate}
									onChange={handleInputChange}
									required
									disabled={isLoading}
									min="0"
									step="0.01"
									placeholder="0"
								/>
							</div>
						</div>

						<div className="flex flex-col gap-1.5">
							<Label htmlFor="creditDate">
								Fecha de Inicio{" "}
								<span className="text-muted-foreground font-normal">(opcional)</span>
							</Label>
							<DatePicker value={creditDate} onChange={setCreditDate} />
							{!creditDate && (
								<p className="text-xs text-muted-foreground">
									Por defecto se usará la fecha de hoy
								</p>
							)}
						</div>

						<div className="bg-muted rounded-md px-3 py-2.5 grid grid-cols-3 gap-x-2 text-sm">
							<div>
								<p className="text-muted-foreground text-xs">Capital</p>
								<p className="font-medium">{formatCOP(Number(formData.value) || 0)}</p>
							</div>
							<div>
								<p className="text-muted-foreground text-xs">Interés mensual</p>
								<p className="font-medium">
									{formatCOP(Math.floor((Number(formData.value) * Number(formData.interestRate)) / 100) || 0)}
								</p>
							</div>
							<div>
								<p className="text-muted-foreground text-xs">Total</p>
								<p className="font-semibold">{formatCOP(totalWithInterest)}</p>
							</div>
						</div>
					</div>

					<div className="px-6 py-4 border-t shrink-0">
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? "Creando..." : "Crear Crédito"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}

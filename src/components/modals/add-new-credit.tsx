"use client";

import { Loader2Icon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createCredit } from "@/lib/actions/credit";
import { formatCOP, getNextPaymentDate } from "@/lib/utils";
import { CreditRequest } from "@/types/credit";

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

		if (!session?.data?.user?.id) {
			toast({
				title: "Error de autenticación",
				description: "Por favor inicia sesión nuevamente",
				variant: "destructive",
				duration: 3000,
			});
			return;
		}

		if (
			!formData.clientCardId ||
			!formData.clientName ||
			!formData.clientPhone ||
			!formData.productName ||
			!formData.value ||
			!formData.interestRate
		) {
			toast({
				title: "Campos requeridos",
				description: "Por favor completa todos los campos",
				variant: "destructive",
				duration: 3000,
			});
			return;
		}

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
				title: "Crédito creado exitosamente",
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
			<DialogContent className="flex max-h-[95vh] flex-col gap-0 p-0 sm:max-w-[520px]">
				<DialogHeader className="shrink-0 border-b border-border px-6 pb-4 pt-6">
					<DialogTitle>Agregar Nuevo Crédito</DialogTitle>
					<DialogDescription>
						Completa el formulario para registrar un nuevo crédito.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
					<div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label htmlFor="clientCardId">
									Cédula <span className="text-destructive">*</span>
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
							<div className="space-y-1.5">
								<Label htmlFor="clientPhone">
									Teléfono <span className="text-destructive">*</span>
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

						<div className="space-y-1.5">
							<Label htmlFor="clientName">
								Nombre <span className="text-destructive">*</span>
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

						<div className="space-y-1.5">
							<Label htmlFor="productName">
								Nombre del Producto <span className="text-destructive">*</span>
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
							<div className="space-y-1.5">
								<Label htmlFor="value">
									Valor del Crédito <span className="text-destructive">*</span>
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
							<div className="space-y-1.5">
								<Label htmlFor="interestRate">
									Interés (%) <span className="text-destructive">*</span>
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

						<div className="space-y-1.5">
							<Label htmlFor="creditDate">
								Fecha de Inicio{" "}
								<span className="font-normal text-text-secondary">(opcional)</span>
							</Label>
							<DatePicker value={creditDate} onChange={setCreditDate} />
							{!creditDate && (
								<p className="text-caption text-text-secondary">
									Por defecto se usará la fecha de hoy
								</p>
							)}
						</div>

						<div className="grid grid-cols-3 gap-3 rounded-panel bg-muted px-4 py-3">
							<div className="space-y-0.5">
								<p className="text-overline uppercase font-semibold text-text-secondary">
									Capital
								</p>
								<p className="font-mono text-small font-medium tabular-nums text-foreground">
									{formatCOP(Number(formData.value) || 0)}
								</p>
							</div>
							<div className="space-y-0.5">
								<p className="text-overline uppercase font-semibold text-text-secondary">
									Interés mensual
								</p>
								<p className="font-mono text-small font-medium tabular-nums text-foreground">
									{formatCOP(
										Math.floor(
											(Number(formData.value) * Number(formData.interestRate)) / 100
										) || 0
									)}
								</p>
							</div>
							<div className="space-y-0.5">
								<p className="text-overline uppercase font-semibold text-text-secondary">
									Total
								</p>
								<p className="font-mono text-small font-semibold tabular-nums text-primary">
									{formatCOP(totalWithInterest)}
								</p>
							</div>
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
									Creando...
								</>
							) : (
								"Crear Crédito"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
	generatePosInvoice,
	printToThermalPrinter,
	printViaSystemDialog,
	printAsText,
} from "@/lib/utils/print-invoice";
import { Printer, Download, Usb } from "lucide-react";

interface Credit {
	id: number;
	clientName: string;
	clientPhone: string;
	clientCardId: number;
	productName: string;
	initialAmount: number;
	interestRate: number;
	interestAmount?: number | null;
	totalAmount: number;
	startDate: Date | null;
	nextPaymentDate: Date | null;
	numPayments?: number | null;
}

interface PrintInvoiceModalProps {
	isOpen: boolean;
	onClose: () => void;
	credit: Credit | null;
}

export default function PrintInvoiceModal({ isOpen, onClose, credit }: PrintInvoiceModalProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [businessInfo, setBusinessInfo] = useState({
		name: "GESTOR DE CREDITOS",
		phone: "",
		address: "",
	});
	const { toast } = useToast();

	const handlePrintThermal = async () => {
		if (!credit) return;

		setIsLoading(true);
		try {
			const buffer = await generatePosInvoice(credit, businessInfo);
			await printToThermalPrinter(buffer);

			toast({
				title: "Éxito",
				description: "Factura enviada a impresora térmica",
				variant: "default",
			});

			onClose();
		} catch (error) {
			console.error("Error al imprimir:", error);
			toast({
				title: "Error",
				description: "No se pudo conectar con la impresora térmica. Verifique la conexión.",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleDownloadBuffer = async () => {
		if (!credit) return;

		try {
			const buffer = await generatePosInvoice(credit, businessInfo);
			const fileName = `factura-${credit.id}-${Date.now()}.bin`;
			printViaSystemDialog(buffer, fileName);

			toast({
				title: "Éxito",
				description: "Archivo de impresión descargado",
				variant: "default",
			});
		} catch (error) {
			console.error("Error al generar archivo:", error);
			toast({
				title: "Error",
				description: "Error al generar el archivo de impresión",
				variant: "destructive",
			});
		}
	};

	const handlePrintText = () => {
		if (!credit) return;

		try {
			printAsText(credit, businessInfo);

			toast({
				title: "Éxito",
				description: "Ventana de impresión abierta",
				variant: "default",
			});
		} catch (error) {
			console.error("Error al imprimir:", error);
			toast({
				title: "Error",
				description: "Error al abrir la ventana de impresión",
				variant: "destructive",
			});
		}
	};

	if (!credit) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Imprimir Factura</DialogTitle>
					<DialogDescription>
						Seleccione el método de impresión para la factura del crédito #{credit.id}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Información del negocio */}
					<div className="space-y-4">
						<h4 className="text-sm font-medium">Información del Negocio</h4>
						<div className="grid gap-3">
							<div>
								<Label htmlFor="business-name">Nombre del Negocio</Label>
								<Input
									id="business-name"
									value={businessInfo.name}
									onChange={(e) =>
										setBusinessInfo((prev) => ({
											...prev,
											name: e.target.value,
										}))
									}
									placeholder="Nombre de su negocio"
								/>
							</div>
							<div>
								<Label htmlFor="business-phone">Teléfono</Label>
								<Input
									id="business-phone"
									value={businessInfo.phone}
									onChange={(e) =>
										setBusinessInfo((prev) => ({
											...prev,
											phone: e.target.value,
										}))
									}
									placeholder="Teléfono del negocio"
								/>
							</div>
							<div>
								<Label htmlFor="business-address">Dirección</Label>
								<Input
									id="business-address"
									value={businessInfo.address}
									onChange={(e) =>
										setBusinessInfo((prev) => ({
											...prev,
											address: e.target.value,
										}))
									}
									placeholder="Dirección del negocio"
								/>
							</div>
						</div>
					</div>

					<Separator />

					{/* Opciones de impresión */}
					<div className="space-y-4">
						<h4 className="text-sm font-medium">Opciones de Impresión</h4>

						<div className="grid gap-3">
							{/* Impresión térmica directa */}
							<Button
								onClick={handlePrintThermal}
								disabled={isLoading}
								className="w-full justify-start h-auto p-4"
								variant="outline"
							>
								<Usb className="mr-3 h-5 w-5" />
								<div className="text-left">
									<div className="font-medium">Impresora Térmica (USB/Serial)</div>
									<div className="text-xs text-muted-foreground">
										Conectar directamente a impresora POS
									</div>
								</div>
							</Button>

							{/* Impresión tradicional */}
							<Button
								onClick={handlePrintText}
								className="w-full justify-start h-auto p-4"
								variant="outline"
							>
								<Printer className="mr-3 h-5 w-5" />
								<div className="text-left">
									<div className="font-medium">Impresión Tradicional</div>
									<div className="text-xs text-muted-foreground">
										Usar impresora del sistema (papel A4)
									</div>
								</div>
							</Button>

							{/* Descargar archivo */}
							<Button
								onClick={handleDownloadBuffer}
								className="w-full justify-start h-auto p-4"
								variant="outline"
							>
								<Download className="mr-3 h-5 w-5" />
								<div className="text-left">
									<div className="font-medium">Descargar Archivo</div>
									<div className="text-xs text-muted-foreground">
										Archivo .bin para software de impresión POS
									</div>
								</div>
							</Button>
						</div>
					</div>

					{/* Información del crédito a imprimir */}
					<div className="bg-gray-50 p-4 rounded-lg">
						<h5 className="text-sm font-medium mb-2">Vista Previa</h5>
						<div className="text-xs space-y-1 text-gray-600">
							<p>
								<strong>Cliente:</strong> {credit.clientName}
							</p>
							<p>
								<strong>Producto:</strong> {credit.productName}
							</p>
							<p>
								<strong>Monto:</strong> ${credit.totalAmount.toLocaleString("es-CO")}
							</p>
							<p>
								<strong>Tasa:</strong> {credit.interestRate}%
							</p>
						</div>
					</div>
				</div>

				<div className="flex justify-end space-x-2">
					<Button variant="outline" onClick={onClose}>
						Cancelar
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

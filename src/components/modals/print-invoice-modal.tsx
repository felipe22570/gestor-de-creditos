"use client";

import { Download, Printer, Usb } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { formatCOP } from "@/lib/utils";
import {
	generatePosInvoice,
	printAsText,
	printToThermalPrinter,
	printViaSystemDialog,
} from "@/lib/utils/print-invoice";

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
			<DialogContent className="sm:max-w-[520px]">
				<DialogHeader>
					<DialogTitle>Imprimir factura</DialogTitle>
					<DialogDescription>
						Selecciona el método de impresión para la factura del crédito #{credit.id}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					<div className="space-y-3">
						<h4 className="text-overline font-semibold uppercase text-muted-foreground">
							Información del negocio
						</h4>
						<div className="space-y-3">
							<div className="space-y-1.5">
								<Label htmlFor="business-name">Nombre del negocio</Label>
								<Input
									id="business-name"
									value={businessInfo.name}
									onChange={(e) =>
										setBusinessInfo((prev) => ({ ...prev, name: e.target.value }))
									}
									placeholder="Nombre de su negocio"
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="business-phone">Teléfono</Label>
								<Input
									id="business-phone"
									value={businessInfo.phone}
									onChange={(e) =>
										setBusinessInfo((prev) => ({ ...prev, phone: e.target.value }))
									}
									placeholder="Teléfono del negocio"
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="business-address">Dirección</Label>
								<Input
									id="business-address"
									value={businessInfo.address}
									onChange={(e) =>
										setBusinessInfo((prev) => ({ ...prev, address: e.target.value }))
									}
									placeholder="Dirección del negocio"
								/>
							</div>
						</div>
					</div>

					<Separator />

					<div className="space-y-3">
						<h4 className="text-overline font-semibold uppercase text-muted-foreground">
							Opciones de impresión
						</h4>

						<div className="grid gap-3">
							<Button
								onClick={handlePrintThermal}
								disabled={isLoading}
								className="h-auto w-full justify-start p-4"
								variant="secondary"
							>
								<Usb className="mr-3 h-5 w-5 text-primary" />
								<div className="text-left">
									<div className="font-medium text-foreground">
										Impresora térmica (USB/Serial)
									</div>
									<div className="text-caption text-text-secondary">
										Conectar directamente a impresora POS
									</div>
								</div>
							</Button>

							<Button
								onClick={handlePrintText}
								className="h-auto w-full justify-start p-4"
								variant="secondary"
							>
								<Printer className="mr-3 h-5 w-5 text-primary" />
								<div className="text-left">
									<div className="font-medium text-foreground">Impresión tradicional</div>
									<div className="text-caption text-text-secondary">
										Usar impresora del sistema (papel A4)
									</div>
								</div>
							</Button>

							<Button
								onClick={handleDownloadBuffer}
								className="h-auto w-full justify-start p-4"
								variant="secondary"
							>
								<Download className="mr-3 h-5 w-5 text-primary" />
								<div className="text-left">
									<div className="font-medium text-foreground">Descargar archivo</div>
									<div className="text-caption text-text-secondary">
										Archivo .bin para software de impresión POS
									</div>
								</div>
							</Button>
						</div>
					</div>

					<div className="rounded-panel bg-muted px-4 py-3">
						<h5 className="mb-2 text-overline font-semibold uppercase text-muted-foreground">
							Vista previa
						</h5>
						<dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-small">
							<dt className="font-medium text-text-secondary">Cliente:</dt>
							<dd className="text-foreground">{credit.clientName}</dd>
							<dt className="font-medium text-text-secondary">Producto:</dt>
							<dd className="text-foreground">{credit.productName}</dd>
							<dt className="font-medium text-text-secondary">Monto:</dt>
							<dd className="font-mono tabular-nums text-foreground">
								{formatCOP(credit.totalAmount)}
							</dd>
							<dt className="font-medium text-text-secondary">Tasa:</dt>
							<dd className="text-foreground">{credit.interestRate}%</dd>
						</dl>
					</div>
				</div>

				<DialogFooter>
					<Button variant="ghost" onClick={onClose}>
						Cerrar
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

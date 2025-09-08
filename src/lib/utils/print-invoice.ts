import { Printer, InMemory, Model, Align } from "escpos-buffer";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface CreditData {
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

export async function generatePosInvoice(
	credit: CreditData,
	businessInfo?: {
		name?: string;
		phone?: string;
		address?: string;
	}
): Promise<Buffer> {
	// Create in-memory connection to capture buffer
	const connection = new InMemory();

	// Create model for generic ESC/POS printer
	const model = new Model("POS-58");

	// Connect printer
	const printer = await Printer.CONNECT(model, connection);

	// Configurar codificación para español
	await printer.setCodepage("cp1252");

	// Header - Información del negocio
	await printer.setAlignment(Align.Center);
	await printer.writeln(businessInfo?.name || "GESTOR DE CREDITOS", 0b00001000); // Bold style
	await printer.writeln();

	if (businessInfo?.phone) {
		await printer.writeln(`Tel: ${businessInfo.phone}`);
	}
	if (businessInfo?.address) {
		await printer.writeln(businessInfo.address);
	}

	await printer.writeln("================================");
	await printer.writeln("FACTURA DE CREDITO", 0b00001000); // Bold style
	await printer.writeln("================================");
	await printer.writeln();

	// Información del crédito
	await printer.setAlignment(Align.Left);
	await printer.writeln(`Factura No: ${credit.id.toString().padStart(6, "0")}`);
	await printer.writeln(`Fecha: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}`);
	await printer.writeln();

	// Información del cliente
	await printer.writeln("DATOS DEL CLIENTE:", 0b00001000); // Bold style
	await printer.writeln(`Nombre: ${credit.clientName}`);
	await printer.writeln(`Telefono: ${credit.clientPhone}`);
	await printer.writeln(`Cedula: ${credit.clientCardId}`);
	await printer.writeln();

	// Detalles del crédito
	await printer.writeln("DETALLES DEL CREDITO:", 0b00001000); // Bold style
	await printer.writeln(`Producto: ${credit.productName}`);
	await printer.writeln(`Monto inicial: $${credit.initialAmount.toLocaleString("es-CO")}`);
	await printer.writeln(`Tasa de interes: ${credit.interestRate}%`);

	if (credit.interestAmount && credit.interestAmount > 0) {
		await printer.writeln(`Interes: $${credit.interestAmount.toLocaleString("es-CO")}`);
	}

	await printer.writeln(`TOTAL: $${credit.totalAmount.toLocaleString("es-CO")}`, 0b00001000); // Bold style

	if (credit.numPayments) {
		await printer.writeln(`Numero de pagos: ${credit.numPayments}`);
	}

	if (credit.startDate) {
		await printer.writeln(`Fecha inicio: ${format(credit.startDate, "dd/MM/yyyy", { locale: es })}`);
	}

	if (credit.nextPaymentDate) {
		await printer.writeln(
			`Proximo pago: ${format(credit.nextPaymentDate, "dd/MM/yyyy", { locale: es })}`
		);
	}

	await printer.writeln();
	await printer.writeln("================================");
	await printer.setAlignment(Align.Center);
	await printer.writeln("¡Gracias por su confianza!");
	await printer.writeln("Pague puntualmente");
	await printer.writeln("================================");
	await printer.writeln();
	await printer.writeln();
	await printer.writeln();

	// Cortar papel
	await printer.cutter();

	// Close connection and return buffer
	await printer.close();
	return connection.buffer();
}

export async function printToThermalPrinter(buffer: Buffer): Promise<void> {
	try {
		// Verificar si el navegador soporta Web Serial API
		if ("serial" in navigator) {
			// Solicitar puerto serie
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const port = await (navigator as any).serial.requestPort();

			// Abrir conexión
			await port.open({
				baudRate: 9600,
				dataBits: 8,
				stopBits: 1,
				parity: "none",
			});

			// Enviar datos
			const writer = port.writable.getWriter();
			await writer.write(new Uint8Array(buffer));
			writer.releaseLock();

			// Cerrar conexión
			await port.close();
		} else {
			throw new Error("Web Serial API no soportada");
		}
	} catch (error) {
		console.error("Error al imprimir:", error);
		throw error;
	}
}

export function printViaSystemDialog(buffer: Buffer, fileName: string = "factura-credito.bin"): void {
	// Crear blob para descarga
	const blob = new Blob([new Uint8Array(buffer)], { type: "application/octet-stream" });
	const url = URL.createObjectURL(blob);

	// Crear enlace de descarga
	const a = document.createElement("a");
	a.href = url;
	a.download = fileName;
	a.style.display = "none";

	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);

	// Limpiar URL
	URL.revokeObjectURL(url);
}

export function printAsText(
	credit: CreditData,
	businessInfo?: {
		name?: string;
		phone?: string;
		address?: string;
	}
): void {
	const content = `
${businessInfo?.name || "GESTOR DE CREDITOS"}
${businessInfo?.phone ? `Tel: ${businessInfo.phone}` : ""}
${businessInfo?.address || ""}

================================
FACTURA DE CREDITO
================================

Factura No: ${credit.id.toString().padStart(6, "0")}
Fecha: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}

DATOS DEL CLIENTE:
Nombre: ${credit.clientName}
Telefono: ${credit.clientPhone}
Cedula: ${credit.clientCardId}

DETALLES DEL CREDITO:
Producto: ${credit.productName}
Monto inicial: $${credit.initialAmount.toLocaleString("es-CO")}
Tasa de interes: ${credit.interestRate}%
${
	credit.interestAmount && credit.interestAmount > 0
		? `Interes: $${credit.interestAmount.toLocaleString("es-CO")}`
		: ""
}
TOTAL: $${credit.totalAmount.toLocaleString("es-CO")}
${credit.numPayments ? `Numero de pagos: ${credit.numPayments}` : ""}
${credit.startDate ? `Fecha inicio: ${format(credit.startDate, "dd/MM/yyyy", { locale: es })}` : ""}
${
	credit.nextPaymentDate
		? `Proximo pago: ${format(credit.nextPaymentDate, "dd/MM/yyyy", { locale: es })}`
		: ""
}

================================
¡Gracias por su confianza!
Pague puntualmente
================================
  `;

	// Abrir ventana de impresión con el contenido
	const printWindow = window.open("", "_blank");
	if (printWindow) {
		printWindow.document.write(`
      <html>
        <head>
          <title>Factura de Crédito</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.2;
              margin: 20px;
              white-space: pre-line;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
		printWindow.document.close();
		printWindow.focus();
		printWindow.print();
	}
}

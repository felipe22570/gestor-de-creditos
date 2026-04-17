"use server";

import db from "@/db";
import { credits, payments } from "@/db/schema";
import { PaymentRequest } from "@/types/payment";
import { Credit } from "@/types/schema";
import { getNextPaymentDate, recalculateNextPaymentDate } from "../utils";
import { eq, and, or, isNull } from "drizzle-orm";

export async function fetchPayments(adminId: number) {
	try {
		const paymentsData = await db.select().from(payments).where(eq(payments.adminId, adminId));

		return paymentsData;
	} catch (error) {
		console.error(error);

		return [];
	}
}

export async function fetchPaymentsByCreditId(creditId: number) {
	try {
		const paymentsData = await db.select().from(payments).where(eq(payments.creditId, creditId));
		return paymentsData;
	} catch (error) {
		console.error(error);
		return [];
	}
}

export async function createCapitalPayment(credit: Credit, amount: number) {
	// Validate credit state
	if (!credit.nextPaymentDate) {
		throw new Error("No se puede pagar un crédito completado");
	}

	if (credit.totalAmount <= 0) {
		throw new Error("El crédito ya está pagado completamente");
	}

	if (credit.totalAmount < 0) {
		throw new Error("El crédito tiene un estado inválido (monto negativo)");
	}

	// Validate payment amount
	if (amount <= 0) {
		throw new Error("El monto debe ser mayor que cero");
	}

	if (amount > credit.totalAmount) {
		throw new Error("El monto no puede ser mayor que el total adeudado");
	}

	const paymentData: PaymentRequest = {
		adminId: credit.adminId,
		clientId: credit.clientCardId,
		creditId: credit.id,
		creditName: credit.productName,
		amountPaid: amount,
		startDate: new Date(),
		clientName: credit.clientName,
		paymentType: "CAPITAL",
	};

	const nextPaymentDate = getNextPaymentDate(credit.nextPaymentDate as Date, credit.startDate as Date);

	const totalResidual = credit.totalAmount - amount;

	try {
		// Use transaction to ensure atomicity
		await db.transaction(async (tx) => {
			await tx.insert(payments).values(paymentData);
			await tx
				.update(credits)
				.set({
					nextPaymentDate,
					totalAmount: totalResidual,
					modifiedDate: new Date(),
				})
				.where(eq(credits.id, credit.id));
		});

		return "Payment created successfully";
	} catch (error) {
		console.error(error);
		throw new Error("Error al procesar el pago");
	}
}

export async function createInterestPayment(credit: Credit, amount: number, addNewInterest: boolean) {
	// Validate credit state
	if (!credit.nextPaymentDate) {
		throw new Error("No se puede pagar un crédito completado");
	}

	// Validate payment amount
	if (amount <= 0) {
		throw new Error("El monto debe ser mayor que cero");
	}

	const paymentData: PaymentRequest = {
		adminId: credit.adminId,
		clientId: credit.clientCardId,
		creditId: credit.id,
		creditName: credit.productName,
		amountPaid: amount,
		startDate: new Date(),
		clientName: credit.clientName,
		paymentType: "INTEREST",
	};

	const nextPaymentDate = getNextPaymentDate(credit.nextPaymentDate as Date, credit.startDate as Date);

	// Calculate new interest amount based on flag
	// If addNewInterest is true, calculate new interest for next month
	// If false, clear the interest (set to 0)
	const newInterestAmount = addNewInterest
		? Math.floor(credit.totalAmount * (credit.interestRate / 100))
		: 0;

	try {
		// Use transaction to ensure atomicity
		await db.transaction(async (tx) => {
			await tx.insert(payments).values(paymentData);
			await tx
				.update(credits)
				.set({
					nextPaymentDate,
					interestAmount: newInterestAmount,
					modifiedDate: new Date(),
				})
				.where(eq(credits.id, credit.id));
		});

		return "Payment created successfully";
	} catch (error) {
		console.error(error);
		throw new Error("Error al procesar el pago de interés");
	}
}

export async function createFullPayment(credit: Credit) {
	// Validate credit state
	if (!credit.nextPaymentDate) {
		throw new Error("No se puede pagar un crédito ya completado");
	}

	if (credit.totalAmount <= 0) {
		throw new Error("El crédito ya está pagado completamente");
	}

	// Calculate total payment amount (capital + interest)
	const totalPaymentAmount = credit.totalAmount + (credit.interestAmount || 0);

	const paymentData: PaymentRequest = {
		adminId: credit.adminId,
		clientId: credit.clientCardId,
		creditId: credit.id,
		creditName: credit.productName,
		amountPaid: totalPaymentAmount,
		startDate: new Date(),
		clientName: credit.clientName,
		paymentType: "FULL",
	};

	try {
		// Use transaction to ensure atomicity
		await db.transaction(async (tx) => {
			await tx.insert(payments).values(paymentData);
			await tx
				.update(credits)
				.set({
					nextPaymentDate: null,
					totalAmount: 0,
					interestAmount: 0,
					modifiedDate: new Date(),
				})
				.where(eq(credits.id, credit.id));
		});

		return "Payment created successfully";
	} catch (error) {
		console.error(error);
		throw new Error("Error al procesar el pago completo");
	}
}

export async function deletePayment(paymentId: number) {
	try {
		const payment = await db.select().from(payments).where(eq(payments.id, paymentId)).get();

		if (!payment) {
			return { success: false, message: "Pago no encontrado" };
		}

		const credit = await db.select().from(credits).where(eq(credits.id, payment.creditId)).get();

		if (!credit) {
			return { success: false, message: "Crédito no encontrado" };
		}

		await db.transaction(async (tx) => {
			// Delete the payment first
			await tx.delete(payments).where(eq(payments.id, paymentId));

			// Count remaining CAPITAL + INTEREST payments for this credit (after deletion)
			const remainingPayments = await tx
				.select()
				.from(payments)
				.where(
					and(
						eq(payments.creditId, payment.creditId),
						or(
							eq(payments.paymentType, "CAPITAL"),
							eq(payments.paymentType, "INTEREST")
						)
					)
				);

			const paymentCount = remainingPayments.length;
			const startDate = credit.startDate as Date;
			const newNextPaymentDate = recalculateNextPaymentDate(startDate, paymentCount);

			if (payment.paymentType === "CAPITAL") {
				await tx
					.update(credits)
					.set({
						totalAmount: credit.totalAmount + (payment.amountPaid || 0),
						nextPaymentDate: newNextPaymentDate,
						modifiedDate: new Date(),
					})
					.where(eq(credits.id, payment.creditId));
			} else if (payment.paymentType === "INTEREST") {
				await tx
					.update(credits)
					.set({
						interestAmount: (credit.interestAmount || 0) + (payment.amountPaid || 0),
						nextPaymentDate: newNextPaymentDate,
						modifiedDate: new Date(),
					})
					.where(eq(credits.id, payment.creditId));
			} else if (payment.paymentType === "FULL") {
				// Restore capital: initialAmount minus all remaining CAPITAL payments
				const totalCapitalPaid = remainingPayments
					.filter((p) => p.paymentType === "CAPITAL")
					.reduce((sum, p) => sum + (p.amountPaid || 0), 0);

				const restoredCapital = credit.initialAmount - totalCapitalPaid;
				const restoredInterest = Math.max(0, (payment.amountPaid || 0) - restoredCapital);

				await tx
					.update(credits)
					.set({
						totalAmount: restoredCapital,
						interestAmount: restoredInterest,
						nextPaymentDate: newNextPaymentDate,
						modifiedDate: new Date(),
					})
					.where(eq(credits.id, payment.creditId));
			}
		});

		return { success: true, message: "Pago eliminado exitosamente" };
	} catch (error) {
		console.error("Error deleting payment:", error);
		return { success: false, message: "Error al eliminar el pago" };
	}
}

export async function fetchTotalRecaudadoForCompletedCredits(adminId: number): Promise<number> {
	try {
		const completedCreditsData = await db
			.select({ id: credits.id })
			.from(credits)
			.where(
				and(
					eq(credits.adminId, adminId),
					isNull(credits.nextPaymentDate),
					eq(credits.totalAmount, 0)
				)
			);

		if (completedCreditsData.length === 0) return 0;

		const completedIds = new Set(completedCreditsData.map((c) => c.id));
		const paymentsData = await db
			.select({ amountPaid: payments.amountPaid, creditId: payments.creditId })
			.from(payments)
			.where(eq(payments.adminId, adminId));

		return paymentsData
			.filter((p) => completedIds.has(p.creditId!))
			.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
	} catch (error) {
		console.error(error);
		return 0;
	}
}

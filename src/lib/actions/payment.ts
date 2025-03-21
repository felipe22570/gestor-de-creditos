"use server";

import db from "@/db";
import { credits, payments } from "@/db/schema";
import { PaymentRequest } from "@/types/payment";
import { Credit } from "@/types/schema";
import { getNextPaymentDate } from "../utils";
import { eq } from "drizzle-orm";

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

export async function createCapitalPayment(credit: Credit, amount: number, interestAmount: number) {
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

	const nextPaymentDate = getNextPaymentDate(credit.nextPaymentDate as Date);

	const totalResidual = credit.totalAmount - amount;

	try {
		await db.insert(payments).values(paymentData);
		await db
			.update(credits)
			.set({
				nextPaymentDate,
				totalAmount: totalResidual,
				interestAmount: interestAmount,
				modifiedDate: new Date(),
			})
			.where(eq(credits.id, credit.id));

		return "Payment created successfully";
	} catch (error) {
		console.error(error);

		return null;
	}
}

export async function createInterestPayment(credit: Credit, amount: number, addNewInterest: boolean) {
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

	const nextPaymentDate = getNextPaymentDate(credit.nextPaymentDate as Date);

	try {
		await db.insert(payments).values(paymentData);

		const updateCreditData = {
			nextPaymentDate,
			modifiedDate: new Date(),
		};
		const finalUpdateData = {
			...updateCreditData,
			...(addNewInterest ? { interestAmount: amount } : {}),
		};

		await db.update(credits).set(finalUpdateData).where(eq(credits.id, credit.id));

		return "Payment created successfully";
	} catch (error) {
		console.error(error);

		return null;
	}
}

export async function deletePayment(paymentId: number) {
	try {
		// First fetch the payment to know its details
		const payment = await db.select().from(payments).where(eq(payments.id, paymentId)).get();

		if (!payment) {
			return { success: false, message: "Payment not found" };
		}

		// Delete the payment
		await db.delete(payments).where(eq(payments.id, paymentId));

		// If it's a capital payment, we need to update the credit amount
		if (payment.paymentType === "CAPITAL" && payment.amountPaid !== null) {
			// Get the credit
			const credit = await db.select().from(credits).where(eq(credits.id, payment.creditId)).get();

			if (credit) {
				// Add back the amount to the total
				const updatedTotalAmount = credit.totalAmount + payment.amountPaid;

				// Update the credit
				await db
					.update(credits)
					.set({
						totalAmount: updatedTotalAmount,
						modifiedDate: new Date(),
					})
					.where(eq(credits.id, payment.creditId));
			}
		}

		return { success: true, message: "Payment deleted successfully" };
	} catch (error) {
		console.error("Error deleting payment:", error);
		return { success: false, message: "Failed to delete payment" };
	}
}

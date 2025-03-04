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

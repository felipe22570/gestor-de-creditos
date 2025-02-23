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

export async function createPayment(credit: Credit, amount: number) {
	const paymentData: PaymentRequest = {
		adminId: credit.adminId,
		clientId: credit.clientCardId,
		creditId: credit.id,
		creditName: credit.productName,
		amountPaid: amount,
		paymentDate: new Date(),
	};

	const nextPaymentDate = getNextPaymentDate(credit.nextPaymentDate as Date);

	try {
		await db.insert(payments).values(paymentData);
		await db
			.update(credits)
			.set({ nextPaymentDate, totalAmount: amount, modifiedDate: new Date() })
			.where(eq(credits.id, credit.id));

		return "Payment created successfully";
	} catch (error) {
		console.error(error);

		return null;
	}
}

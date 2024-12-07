"use server";

import db from "@/db";
import { credits } from "@/db/schema";
import { CreditRequest } from "@/types/credit";
import { eq } from "drizzle-orm";

export async function fetchCredits(adminId: number) {
	try {
		const results = await db.select().from(credits).where(eq(credits.adminId, adminId));

		return results;
	} catch (error) {
		console.error(error);

		return [];
	}
}

export async function createCredit(credit: CreditRequest) {
	try {
		await db.insert(credits).values(credit);

		return "Credit created successfully";
	} catch (error) {
		console.error(error);

		return null;
	}
}

export async function fetchCreditById(creditId: number) {
	try {
		const results = await db.select().from(credits).where(eq(credits.id, creditId));

		return results[0];
	} catch (error) {
		console.error(error);

		return null;
	}
}

export async function editCredit(creditId: number, credit: CreditRequest | Partial<CreditRequest>) {
	const modifiedDate = new Date();

	try {
		await db
			.update(credits)
			.set({ ...credit, modifiedDate })
			.where(eq(credits.id, creditId));

		return "Credit updated successfully";
	} catch (error) {
		console.error(error);

		return null;
	}
}

export async function deleteCredit(creditId: number) {
	try {
		await db.delete(credits).where(eq(credits.id, creditId));

		return "Credit deleted successfully";
	} catch (error) {
		console.error(error);

		return null;
	}
}

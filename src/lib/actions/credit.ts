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

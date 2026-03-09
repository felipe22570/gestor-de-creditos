import { NextResponse } from "next/server";
import { headers } from "next/headers";
import db from "@/db";
import { credits } from "@/db/schema";
import { eq, isNull, not } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { isMonthlyAnniversaryPlusOne } from "@/lib/utils";

// Vercel secret token to verify requests
// You'll need to set this in Vercel's dashboard
const CRON_SECRET = process.env.CRON_SECRET;

/**
 * Daily interest calculation for active credits
 * This function is called by Vercel's scheduled jobs feature
 */
export async function GET() {
	// Get the authorization header
	const headersList = headers();
	const authorization = headersList.get("authorization");

	// Verify the secret token
	if (authorization !== `Bearer ${CRON_SECRET}`) {
		return new NextResponse(
			JSON.stringify({
				error: "Unauthorized",
			}),
			{
				status: 401,
				headers: {
					"Content-Type": "application/json",
				},
			}
		);
	}

	try {
		// Current date for comparison
		const currentDate = new Date();
		const todayDateString = currentDate.toDateString();

		// Get all active credits
		const activeCredits = await db
			.select()
			.from(credits)
			.where(not(isNull(credits.nextPaymentDate)));

		let updatedCredits = 0;
		let skippedCredits = 0;

		// Process each credit
		for (const credit of activeCredits) {
			// Skip if no start date
			if (!credit.startDate) continue;

			// Skip if total amount is zero or negative
			if (credit.totalAmount <= 0) {
				skippedCredits++;
				continue;
			}

			// Convert timestamp to Date (timestamps in DB are in seconds)
			const startDateObj = new Date(Number(credit.startDate) * 1000);

			// Check for duplicate processing - skip if already processed today
			if (credit.modifiedDate) {
				const lastModifiedDate = new Date(Number(credit.modifiedDate) * 1000);
				const lastModifiedDateString = lastModifiedDate.toDateString();
				
				if (lastModifiedDateString === todayDateString) {
					// Already processed today, skip to avoid duplicate interest calculation
					skippedCredits++;
					continue;
				}
			}

			// Check if today is one day after the monthly anniversary date
			const isMonthlyInterestDay = isMonthlyAnniversaryPlusOne(startDateObj, currentDate);

			if (isMonthlyInterestDay) {
				// Calculate interest amount (interestRate is stored as percentage)
				const interestAmount = Math.floor(credit.totalAmount * (credit.interestRate / 100));

				// Current interest amount (or 0 if null)
				const currentInterest = credit.interestAmount || 0;

				// Update the interest amount - using sql literal for the timestamp
				await db
					.update(credits)
					.set({
						interestAmount: currentInterest + interestAmount,
						modifiedDate: sql`(strftime('%s','now'))`,
					})
					.where(eq(credits.id, credit.id));

				updatedCredits++;
			}
		}

		return NextResponse.json({
			success: true,
			message: `Interest calculation completed successfully. Updated ${updatedCredits} credits, skipped ${skippedCredits} credits.`,
			updatedCredits,
			skippedCredits,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Error calculating daily interest:", error);

		return NextResponse.json(
			{
				success: false,
				error: "Failed to calculate interest",
				message: error instanceof Error ? error.message : "Unknown error",
				timestamp: new Date().toISOString(),
			},
			{ status: 500 }
		);
	}
}


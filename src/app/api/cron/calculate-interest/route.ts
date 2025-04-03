import { NextResponse } from "next/server";
import { headers } from "next/headers";
import db from "@/db";
import { credits } from "@/db/schema";
import { eq, isNull, not } from "drizzle-orm";
import { sql } from "drizzle-orm";

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

		// Get all active credits
		const activeCredits = await db
			.select()
			.from(credits)
			.where(not(isNull(credits.nextPaymentDate)));

		let updatedCredits = 0;

		// Process each credit
		for (const credit of activeCredits) {
			// Skip if no start date
			if (!credit.startDate) continue;

			// Convert timestamp to Date (timestamps in DB are in seconds)
			const startDateObj = new Date(Number(credit.startDate) * 1000);

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
			message: `Interest calculation completed successfully. Updated ${updatedCredits} credits.`,
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

/**
 * Checks if the current date is one day after the monthly anniversary of the start date
 * For example, if start date is January 12, this will return true on February 13, March 13, etc.
 * Handles edge cases for month ends (e.g., if start date is Jan 31, will return true on Mar 1)
 */
function isMonthlyAnniversaryPlusOne(startDate: Date, currentDate: Date): boolean {
	// Get the day of the month from the start date
	const startDay = startDate.getDate();
	const currentDay = currentDate.getDate();
	const currentMonth = currentDate.getMonth();
	const currentYear = currentDate.getFullYear();

	// Special handling for months with fewer days
	// If the start date is on the 29th, 30th, or 31st
	if (startDay >= 29) {
		// Get the last day of previous month
		const lastDayPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

		// Check if previous month didn't have enough days to match the start day
		// (e.g., start date was Jan 30, and previous month was Feb with 28/29 days)
		if (startDay > lastDayPrevMonth) {
			// Check if today is the 1st day of the month (day after the last day of previous month)
			return currentDay === 1;
		}
	}

	// For normal cases - check if current date matches the day after anniversary
	return currentDay === startDay + 1 && currentDate.getTime() > startDate.getTime();
}

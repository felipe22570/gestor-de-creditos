import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { addMonths, isLastDayOfMonth, endOfMonth } from "date-fns";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const formatCOP = (value: number) => {
	const formattedValue = new Intl.NumberFormat("es-CO", {
		style: "currency",
		currency: "COP",
		minimumFractionDigits: 0,
	}).format(value);

	return formattedValue;
};

/**
 * Calculates the next payment date by advancing 1 month from paymentDate.
 * If startDate is provided, preserves the original day-of-month to avoid drift
 * (e.g., a credit started on the 30th stays on the 30th, not drifting to 31st after February).
 * If the resulting date is still in the past (overdue credit), keeps advancing
 * month by month until the date is in the future.
 */
export const getNextPaymentDate = (paymentDate: Date, startDate?: Date) => {
	const referenceDate = startDate ?? paymentDate;
	const referenceDay = referenceDate.getDate();
	const isOriginalLastDay = isLastDayOfMonth(referenceDate);

	const advanceOneMonth = (fromDate: Date): Date => {
		let next = addMonths(fromDate, 1);

		if (isOriginalLastDay) {
			next = endOfMonth(next);
		} else {
			const lastDay = endOfMonth(next).getDate();
			const targetDay = Math.min(referenceDay, lastDay);
			next = new Date(next.getFullYear(), next.getMonth(), targetDay);
		}

		return next;
	};

	let nextPaymentDate = advanceOneMonth(paymentDate);

	// For overdue credits: advance until the date is in the future
	const now = new Date();
	while (nextPaymentDate <= now) {
		nextPaymentDate = advanceOneMonth(nextPaymentDate);
	}

	return nextPaymentDate;
};

/**
 * Recalculates nextPaymentDate from scratch based on startDate and the
 * number of CAPITAL/INTEREST payments remaining for the credit.
 * Each such payment represents one month advancement from the start date.
 */
export function recalculateNextPaymentDate(startDate: Date, paymentCount: number): Date {
	const referenceDay = startDate.getDate();
	const isOriginalLastDay = isLastDayOfMonth(startDate);

	// nextPaymentDate = startDate + (paymentCount + 1) months
	// +1 because the first nextPaymentDate at credit creation is startDate + 1 month
	let date = startDate;
	const totalMonths = paymentCount + 1;

	for (let i = 0; i < totalMonths; i++) {
		date = addMonths(date, 1);
		if (isOriginalLastDay) {
			date = endOfMonth(date);
		} else {
			const lastDay = endOfMonth(date).getDate();
			const targetDay = Math.min(referenceDay, lastDay);
			date = new Date(date.getFullYear(), date.getMonth(), targetDay);
		}
	}

	return date;
}

/**
 * Checks if the current date is one day after the monthly anniversary of the start date.
 * For example, if start date is January 12, this will return true on February 13, March 13, etc.
 * Handles edge cases for month ends properly:
 * - If start date is Jan 31, will trigger on Mar 1 (Feb 28/29 + 1 day)
 * - If start date is Jan 30, will trigger on Mar 1 (Feb 28/29 + 1 day) in non-leap years
 * - If start date is Jan 29 (non-leap year), will trigger on Mar 1 (Feb 28 + 1 day)
 */
export function isMonthlyAnniversaryPlusOne(startDate: Date, currentDate: Date): boolean {
	// Don't process if current date is before or same as start date
	if (currentDate <= startDate) return false;

	const startDay = startDate.getDate();
	const startMonth = startDate.getMonth();
	const startYear = startDate.getFullYear();

	const currentDay = currentDate.getDate();
	const currentMonth = currentDate.getMonth();
	const currentYear = currentDate.getFullYear();

	// Calculate total months difference
	const monthsDiff = (currentYear - startYear) * 12 + (currentMonth - startMonth);

	// Must be at least 1 month after start date
	if (monthsDiff < 1) return false;

	// Calculate what the anniversary date should be in the current month
	// If start day is 31 but current month only has 30 days, anniversary is on the 30th
	const lastDayOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
	const anniversaryDay = Math.min(startDay, lastDayOfCurrentMonth);

	// The target day is one day after the anniversary
	const targetDay = anniversaryDay + 1;

	// Handle month overflow (e.g., anniversary on last day of month, so +1 goes to next month)
	if (targetDay > lastDayOfCurrentMonth) {
		// The anniversary was on the last day of the previous month
		// So if today is the 1st, we're one day after the anniversary
		return currentDay === 1;
	}

	// Normal case: check if today matches anniversary + 1 day in the same month
	return currentDay === targetDay;
}

/**
 * Calculates interest amount based on capital and interest rate.
 * Formula: floor(totalAmount * (interestRate / 100))
 */
export function calculateInterest(totalAmount: number, interestRate: number): number {
	return Math.floor(totalAmount * (interestRate / 100));
}

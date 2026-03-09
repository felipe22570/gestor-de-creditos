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

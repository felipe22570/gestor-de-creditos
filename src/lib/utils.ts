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

export const getNextPaymentDate = (paymentDate: Date) => {
	// Check if the payment is on the last day of the month
	const isLastDay = isLastDayOfMonth(paymentDate);

	// Get the next month's date
	let nextPaymentDate = addMonths(paymentDate, 1);

	// If original payment was on the last day of the month,
	// ensure next payment is also on the last day
	if (isLastDay) {
		nextPaymentDate = endOfMonth(nextPaymentDate);
	}

	return nextPaymentDate;
};

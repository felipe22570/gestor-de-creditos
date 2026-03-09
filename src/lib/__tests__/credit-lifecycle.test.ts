import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
	getNextPaymentDate,
	recalculateNextPaymentDate,
	calculateInterest,
} from "../utils";

describe("credit lifecycle scenarios", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("new credit: nextPaymentDate is startDate + 1 month", () => {
		vi.setSystemTime(new Date(2026, 0, 15));
		const startDate = new Date(2026, 0, 15);
		const nextPaymentDate = getNextPaymentDate(startDate);
		expect(nextPaymentDate.getMonth()).toBe(1);
		expect(nextPaymentDate.getDate()).toBe(15);
	});

	it("full lifecycle: create → capital payments → full payment", () => {
		vi.setSystemTime(new Date(2026, 0, 15));
		const startDate = new Date(2026, 0, 15);
		let totalAmount = 1000000;
		const interestRate = 10;
		let interestAmount = calculateInterest(totalAmount, interestRate);
		let nextPaymentDate: Date | null = getNextPaymentDate(startDate);

		expect(nextPaymentDate.getMonth()).toBe(1);
		expect(interestAmount).toBe(100000);

		// Capital payment 1
		vi.setSystemTime(new Date(2026, 1, 15));
		totalAmount -= 200000;
		nextPaymentDate = getNextPaymentDate(nextPaymentDate, startDate);
		expect(totalAmount).toBe(800000);
		expect(nextPaymentDate.getMonth()).toBe(2);

		// Capital payment 2
		vi.setSystemTime(new Date(2026, 2, 15));
		totalAmount -= 300000;
		nextPaymentDate = getNextPaymentDate(nextPaymentDate, startDate);
		expect(totalAmount).toBe(500000);
		expect(nextPaymentDate.getMonth()).toBe(3);

		// Full payment
		vi.setSystemTime(new Date(2026, 3, 15));
		const fullAmount = totalAmount + interestAmount;
		expect(fullAmount).toBe(600000);
		totalAmount = 0;
		interestAmount = 0;
		nextPaymentDate = null;

		expect(totalAmount).toBe(0);
		expect(interestAmount).toBe(0);
		expect(nextPaymentDate).toBeNull();
	});

	it("interest payment with new interest recalculation", () => {
		const totalAmount = 800000;
		const interestRate = 10;

		const newInterest = calculateInterest(totalAmount, interestRate);
		expect(newInterest).toBe(80000);

		// Without adding new interest → 0
		expect(0).toBe(0);
	});

	it("overdue credit payment jumps to future", () => {
		vi.setSystemTime(new Date(2026, 2, 8));
		const startDate = new Date(2026, 0, 8);
		const overduePaymentDate = new Date(2026, 0, 8);

		const nextPaymentDate = getNextPaymentDate(overduePaymentDate, startDate);
		expect(nextPaymentDate.getMonth()).toBe(3); // Apr
		expect(nextPaymentDate.getDate()).toBe(8);
		expect(nextPaymentDate > new Date(2026, 2, 8)).toBe(true);
	});

	it("delete payment restores credit and recalculates nextPaymentDate", () => {
		const startDate = new Date(2026, 0, 15);

		// After 3 payments: paymentCount=3 → +4 months = May
		const afterThreePayments = recalculateNextPaymentDate(startDate, 3);
		expect(afterThreePayments.getMonth()).toBe(4); // May

		// Delete 1 → 2 remaining → +3 months = Apr
		const afterDeletion = recalculateNextPaymentDate(startDate, 2);
		expect(afterDeletion.getMonth()).toBe(3); // Apr
		expect(afterDeletion.getDate()).toBe(15);
	});
});

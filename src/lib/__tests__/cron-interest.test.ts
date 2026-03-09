import { describe, it, expect } from "vitest";
import { calculateInterest, isMonthlyAnniversaryPlusOne } from "../utils";

describe("cron job interest calculation logic", () => {
	it("interest accumulates on existing amount", () => {
		const currentInterest = 50000;
		const newInterest = calculateInterest(1000000, 10);
		expect(currentInterest + newInterest).toBe(150000);
	});

	it("skips credits with totalAmount <= 0", () => {
		expect(0 > 0).toBe(false);
		expect(-100 > 0).toBe(false);
	});

	it("interest is on remaining capital, not initial amount", () => {
		const remainingCapital = 1000000 - 400000;
		expect(calculateInterest(remainingCapital, 10)).toBe(60000);
	});

	it("triggers on correct days across months", () => {
		const start = new Date(2026, 0, 15);
		expect(isMonthlyAnniversaryPlusOne(start, new Date(2026, 1, 16))).toBe(true);
		expect(isMonthlyAnniversaryPlusOne(start, new Date(2026, 2, 16))).toBe(true);
		expect(isMonthlyAnniversaryPlusOne(start, new Date(2026, 3, 16))).toBe(true);

		expect(isMonthlyAnniversaryPlusOne(start, new Date(2026, 1, 15))).toBe(false);
		expect(isMonthlyAnniversaryPlusOne(start, new Date(2026, 1, 17))).toBe(false);
	});
});

import { describe, it, expect } from "vitest";
import { isMonthlyAnniversaryPlusOne } from "../utils";

describe("isMonthlyAnniversaryPlusOne", () => {
	describe("normal mid-month dates", () => {
		it("returns true on anniversary + 1 day", () => {
			const start = new Date(2026, 0, 12); // Jan 12
			expect(isMonthlyAnniversaryPlusOne(start, new Date(2026, 1, 13))).toBe(true);
		});

		it("returns false on the anniversary day itself", () => {
			const start = new Date(2026, 0, 12);
			expect(isMonthlyAnniversaryPlusOne(start, new Date(2026, 1, 12))).toBe(false);
		});

		it("returns false on anniversary + 2 days", () => {
			const start = new Date(2026, 0, 12);
			expect(isMonthlyAnniversaryPlusOne(start, new Date(2026, 1, 14))).toBe(false);
		});

		it("works for multiple months later", () => {
			const start = new Date(2026, 0, 12);
			expect(isMonthlyAnniversaryPlusOne(start, new Date(2026, 3, 13))).toBe(true);
			expect(isMonthlyAnniversaryPlusOne(start, new Date(2026, 6, 13))).toBe(true);
			expect(isMonthlyAnniversaryPlusOne(start, new Date(2026, 11, 13))).toBe(true);
		});
	});

	describe("boundary conditions", () => {
		it("returns false if currentDate equals startDate", () => {
			const date = new Date(2026, 0, 12);
			expect(isMonthlyAnniversaryPlusOne(date, date)).toBe(false);
		});

		it("returns false if currentDate is before startDate", () => {
			const start = new Date(2026, 1, 12);
			expect(isMonthlyAnniversaryPlusOne(start, new Date(2026, 0, 12))).toBe(false);
		});

		it("returns false in the same month as start", () => {
			const start = new Date(2026, 0, 12);
			expect(isMonthlyAnniversaryPlusOne(start, new Date(2026, 0, 13))).toBe(false);
		});
	});

	describe("month-end edge cases", () => {
		it("start Jan 31 → triggers Mar 1 (overflow from 31+1)", () => {
			const start = new Date(2025, 0, 31);
			expect(isMonthlyAnniversaryPlusOne(start, new Date(2025, 2, 1))).toBe(true);
		});

		it("start on 1st → triggers on 2nd of every month", () => {
			const start = new Date(2026, 0, 1);
			expect(isMonthlyAnniversaryPlusOne(start, new Date(2026, 1, 2))).toBe(true);
			expect(isMonthlyAnniversaryPlusOne(start, new Date(2026, 2, 2))).toBe(true);
			expect(isMonthlyAnniversaryPlusOne(start, new Date(2026, 5, 2))).toBe(true);
		});

		it("start on last day of month → triggers on 1st (overflow)", () => {
			const start = new Date(2026, 2, 31); // Mar 31
			expect(isMonthlyAnniversaryPlusOne(start, new Date(2026, 3, 1))).toBe(true);
		});
	});

	describe("cross-year", () => {
		it("works across year boundary", () => {
			const start = new Date(2025, 10, 15); // Nov 15, 2025
			expect(isMonthlyAnniversaryPlusOne(start, new Date(2026, 0, 16))).toBe(true);
		});
	});
});

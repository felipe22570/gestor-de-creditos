import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getNextPaymentDate } from "../utils";

describe("getNextPaymentDate", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2026, 2, 8)); // Mar 8, 2026
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("basic month advancement", () => {
		it("advances mid-month date by 1 month", () => {
			const date = new Date(2026, 2, 15); // Mar 15
			const next = getNextPaymentDate(date);
			expect(next.getFullYear()).toBe(2026);
			expect(next.getMonth()).toBe(3); // April
			expect(next.getDate()).toBe(15);
		});

		it("advances from Jan 15 to Feb 15", () => {
			vi.setSystemTime(new Date(2026, 0, 16)); // Jan 16
			const date = new Date(2026, 0, 15); // Jan 15
			const next = getNextPaymentDate(date);
			expect(next.getMonth()).toBe(1); // Feb
			expect(next.getDate()).toBe(15);
		});
	});

	describe("last day of month preservation", () => {
		it("Jan 31 → Feb 28 (non-leap) when reference is last day", () => {
			vi.setSystemTime(new Date(2025, 1, 1));
			const date = new Date(2025, 0, 31);
			const next = getNextPaymentDate(date);
			expect(next.getMonth()).toBe(1);
			expect(next.getDate()).toBe(28);
		});

		it("Jan 31 → Feb 29 (leap year) when reference is last day", () => {
			vi.setSystemTime(new Date(2028, 1, 1));
			const date = new Date(2028, 0, 31);
			const next = getNextPaymentDate(date);
			expect(next.getMonth()).toBe(1);
			expect(next.getDate()).toBe(29);
		});

		it("Feb 28 (last day, non-leap) → Mar 31 when reference is last day", () => {
			vi.setSystemTime(new Date(2025, 2, 1));
			const date = new Date(2025, 1, 28); // Feb 28 = last day in 2025
			const next = getNextPaymentDate(date);
			expect(next.getMonth()).toBe(2); // Mar
			expect(next.getDate()).toBe(31);
		});
	});

	describe("day drift prevention (startDate parameter)", () => {
		it("preserves day 30 across February", () => {
			vi.setSystemTime(new Date(2025, 1, 1));
			const paymentDate = new Date(2025, 1, 28); // Feb 28 (clamped)
			const startDate = new Date(2025, 0, 30); // original start: Jan 30
			const next = getNextPaymentDate(paymentDate, startDate);
			expect(next.getMonth()).toBe(2); // Mar
			expect(next.getDate()).toBe(30);
		});

		it("preserves day 29 across February (non-leap)", () => {
			vi.setSystemTime(new Date(2025, 1, 1));
			const paymentDate = new Date(2025, 1, 28);
			const startDate = new Date(2025, 0, 29);
			const next = getNextPaymentDate(paymentDate, startDate);
			expect(next.getMonth()).toBe(2); // Mar
			expect(next.getDate()).toBe(29);
		});

		it("day 15 stays 15 regardless of startDate", () => {
			const paymentDate = new Date(2026, 1, 15);
			const startDate = new Date(2026, 0, 15);
			const next = getNextPaymentDate(paymentDate, startDate);
			expect(next.getDate()).toBe(15);
		});

		it("preserves day 30 across a full year cycle", () => {
			const startDate = new Date(2025, 0, 30);
			let current = startDate;

			// Expected: Feb=28 (clamped), then 30 for all other months
			const expectedMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0];
			const expectedDays = [28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30];

			for (let i = 0; i < expectedDays.length; i++) {
				// Set system time BEFORE the expected next date so it doesn't skip
				vi.setSystemTime(new Date(2025, 0, 31)); // always in the past relative to result
				const next = getNextPaymentDate(current, startDate);
				expect(next.getMonth()).toBe(expectedMonths[i]);
				expect(next.getDate()).toBe(expectedDays[i]);
				current = next;
			}
		});
	});

	describe("overdue credit auto-advancement", () => {
		it("advances past now if result would still be in the past", () => {
			vi.setSystemTime(new Date(2026, 2, 8)); // Mar 8
			const paymentDate = new Date(2026, 0, 8); // Jan 8 (2 months overdue)
			const next = getNextPaymentDate(paymentDate);
			// Jan 8 + 1 = Feb 8 (past) → Mar 8 (<=now) → Apr 8
			expect(next.getMonth()).toBe(3); // April
			expect(next.getDate()).toBe(8);
		});

		it("3 months overdue advances to the future", () => {
			vi.setSystemTime(new Date(2026, 5, 15)); // Jun 15
			const paymentDate = new Date(2026, 1, 15); // Feb 15
			const next = getNextPaymentDate(paymentDate);
			expect(next.getMonth()).toBe(6); // July
			expect(next.getDate()).toBe(15);
		});

		it("exactly on now advances to next month", () => {
			vi.setSystemTime(new Date(2026, 2, 8, 12, 0, 0));
			const paymentDate = new Date(2026, 1, 8); // Feb 8
			const next = getNextPaymentDate(paymentDate);
			// Feb 8 + 1 = Mar 8. Mar 8 <= now → Apr 8
			expect(next.getMonth()).toBe(3);
			expect(next.getDate()).toBe(8);
		});

		it("payment date just 1 day overdue only advances 1 month", () => {
			vi.setSystemTime(new Date(2026, 2, 9));
			const paymentDate = new Date(2026, 2, 8);
			const next = getNextPaymentDate(paymentDate);
			expect(next.getMonth()).toBe(3); // Apr 8
			expect(next.getDate()).toBe(8);
		});
	});

	describe("edge cases", () => {
		it("handles Dec → Jan year boundary", () => {
			vi.setSystemTime(new Date(2026, 0, 1));
			const date = new Date(2025, 11, 15); // Dec 15, 2025
			const next = getNextPaymentDate(date);
			expect(next.getFullYear()).toBe(2026);
			expect(next.getMonth()).toBe(0); // Jan
			expect(next.getDate()).toBe(15);
		});

		it("handles Feb 29 leap year with startDate preserving day 29", () => {
			vi.setSystemTime(new Date(2028, 2, 1));
			const paymentDate = new Date(2028, 1, 29); // Feb 29, 2028 (leap)
			const startDate = new Date(2028, 0, 29);
			const next = getNextPaymentDate(paymentDate, startDate);
			expect(next.getMonth()).toBe(2); // Mar
			expect(next.getDate()).toBe(29);
		});
	});
});

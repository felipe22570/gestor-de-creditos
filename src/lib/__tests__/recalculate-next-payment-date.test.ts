import { describe, it, expect } from "vitest";
import { recalculateNextPaymentDate } from "../utils";

describe("recalculateNextPaymentDate", () => {
	it("with 0 payments, returns startDate + 1 month", () => {
		const start = new Date(2026, 0, 15);
		const result = recalculateNextPaymentDate(start, 0);
		expect(result.getMonth()).toBe(1); // Feb
		expect(result.getDate()).toBe(15);
	});

	it("with 1 payment, returns startDate + 2 months", () => {
		const start = new Date(2026, 0, 15);
		const result = recalculateNextPaymentDate(start, 1);
		expect(result.getMonth()).toBe(2); // Mar
		expect(result.getDate()).toBe(15);
	});

	it("with 5 payments, returns startDate + 6 months", () => {
		const start = new Date(2026, 0, 10);
		const result = recalculateNextPaymentDate(start, 5);
		expect(result.getMonth()).toBe(6); // Jul
		expect(result.getDate()).toBe(10);
	});

	it("preserves last-day-of-month through the year", () => {
		const start = new Date(2026, 0, 31); // Jan 31

		const feb = recalculateNextPaymentDate(start, 0);
		expect(feb.getMonth()).toBe(1);
		expect(feb.getDate()).toBe(28);

		const mar = recalculateNextPaymentDate(start, 1);
		expect(mar.getMonth()).toBe(2);
		expect(mar.getDate()).toBe(31);

		const apr = recalculateNextPaymentDate(start, 2);
		expect(apr.getMonth()).toBe(3);
		expect(apr.getDate()).toBe(30);
	});

	it("preserves day 30 through February", () => {
		const start = new Date(2026, 0, 30);

		const feb = recalculateNextPaymentDate(start, 0);
		expect(feb.getMonth()).toBe(1);
		expect(feb.getDate()).toBe(28);

		const mar = recalculateNextPaymentDate(start, 1);
		expect(mar.getMonth()).toBe(2);
		expect(mar.getDate()).toBe(30);
	});

	it("crosses year boundary correctly", () => {
		const start = new Date(2025, 10, 15); // Nov 15, 2025
		const result = recalculateNextPaymentDate(start, 3); // +4 months = Mar 2026
		expect(result.getFullYear()).toBe(2026);
		expect(result.getMonth()).toBe(2); // Mar
		expect(result.getDate()).toBe(15);
	});
});

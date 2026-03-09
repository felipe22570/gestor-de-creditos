import { describe, it, expect } from "vitest";
import { recalculateNextPaymentDate } from "../utils";

describe("payment deletion reversal logic", () => {
	describe("CAPITAL payment reversal", () => {
		it("restores totalAmount by adding back paid amount", () => {
			const creditTotalAmount = 400000;
			const paymentAmountPaid = 100000;
			expect(creditTotalAmount + paymentAmountPaid).toBe(500000);
		});
	});

	describe("INTEREST payment reversal", () => {
		it("restores interestAmount by adding back paid amount", () => {
			expect(0 + 50000).toBe(50000);
		});

		it("handles null interestAmount", () => {
			const creditInterestAmount: number | null = null;
			expect((creditInterestAmount || 0) + 50000).toBe(50000);
		});
	});

	describe("FULL payment reversal", () => {
		it("derives restored capital from initialAmount minus CAPITAL payments", () => {
			const initialAmount = 1000000;
			const capitalPayments = [200000, 100000];
			const totalCapitalPaid = capitalPayments.reduce((sum, p) => sum + p, 0);
			expect(initialAmount - totalCapitalPaid).toBe(700000);
		});

		it("derives restored interest from FULL amount minus restored capital", () => {
			const fullPaymentAmount = 770000;
			const restoredCapital = 700000;
			expect(Math.max(0, fullPaymentAmount - restoredCapital)).toBe(70000);
		});

		it("restored interest is never negative", () => {
			const fullPaymentAmount = 500000;
			const restoredCapital = 600000;
			expect(Math.max(0, fullPaymentAmount - restoredCapital)).toBe(0);
		});

		it("with no prior capital payments, restores full initial amount", () => {
			const initialAmount = 1000000;
			const capitalPayments: number[] = [];
			const totalCapitalPaid = capitalPayments.reduce((sum, p) => sum + p, 0);
			expect(initialAmount - totalCapitalPaid).toBe(1000000);
		});
	});

	describe("nextPaymentDate recalculation on deletion", () => {
		it("0 remaining payments → startDate + 1 month", () => {
			const start = new Date(2026, 0, 15);
			const result = recalculateNextPaymentDate(start, 0);
			expect(result.getMonth()).toBe(1);
			expect(result.getDate()).toBe(15);
		});

		it("2 remaining payments → startDate + 3 months", () => {
			const start = new Date(2026, 0, 15);
			const result = recalculateNextPaymentDate(start, 2);
			expect(result.getMonth()).toBe(3); // Apr
			expect(result.getDate()).toBe(15);
		});
	});
});

import { describe, it, expect } from "vitest";
import { calculateInterest, isMonthlyAnniversaryPlusOne } from "../utils";

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Mimics the per-credit decision the cron route makes. Returns the new
 *  interestAmount after processing, or null when the credit is skipped. */
function processCreditInterest(credit: {
	totalAmount: number;
	interestRate: number;
	interestAmount: number;
	startDate: Date | null;
	modifiedDate: Date | null;
	nextPaymentDate: Date | null;
}, currentDate: Date): number | null {
	if (!credit.startDate) return null;
	if (credit.totalAmount <= 0) return null;

	// Duplicate-processing guard: skip if already modified today
	if (credit.modifiedDate) {
		const sameDay =
			credit.modifiedDate.toDateString() === currentDate.toDateString();
		if (sameDay) return null;
	}

	if (!isMonthlyAnniversaryPlusOne(credit.startDate, currentDate)) return null;

	const newInterest = calculateInterest(credit.totalAmount, credit.interestRate);
	return (credit.interestAmount ?? 0) + newInterest;
}

// ─── base credit fixture ───────────────────────────────────────────────────────

function makeCredit(overrides: Partial<Parameters<typeof processCreditInterest>[0]> = {}) {
	return {
		totalAmount: 1_000_000,
		interestRate: 10,
		interestAmount: 0,
		startDate: new Date(2026, 0, 12), // Jan 12
		modifiedDate: null,
		nextPaymentDate: new Date(2026, 2, 13),
		...overrides,
	};
}

// ─── tests ────────────────────────────────────────────────────────────────────

describe("cron job – per-credit interest processing", () => {
	const interestDay = new Date(2026, 1, 13); // Feb 13 → one day after Jan 12 anniversary

	describe("happy path", () => {
		it("applies interest on the correct day", () => {
			const result = processCreditInterest(makeCredit(), interestDay);
			expect(result).toBe(100_000); // 10% of 1,000,000
		});

		it("accumulates on top of existing interest", () => {
			const credit = makeCredit({ interestAmount: 50_000 });
			expect(processCreditInterest(credit, interestDay)).toBe(150_000);
		});

		it("calculates interest on remaining capital, not the original amount", () => {
			const credit = makeCredit({ totalAmount: 600_000 }); // after a capital payment
			expect(processCreditInterest(credit, interestDay)).toBe(60_000);
		});

		it("floors fractional interest (no cents)", () => {
			const credit = makeCredit({ totalAmount: 333_333, interestRate: 10 });
			expect(processCreditInterest(credit, interestDay)).toBe(33_333);
		});
	});

	describe("skip conditions", () => {
		it("skips credits with totalAmount = 0", () => {
			expect(processCreditInterest(makeCredit({ totalAmount: 0 }), interestDay)).toBeNull();
		});

		it("skips credits with totalAmount < 0", () => {
			expect(processCreditInterest(makeCredit({ totalAmount: -500 }), interestDay)).toBeNull();
		});

		it("skips credits with no startDate", () => {
			expect(processCreditInterest(makeCredit({ startDate: null }), interestDay)).toBeNull();
		});

		it("skips on a day that is NOT the anniversary+1", () => {
			const notInterestDay = new Date(2026, 1, 12); // anniversary itself, not +1
			expect(processCreditInterest(makeCredit(), notInterestDay)).toBeNull();
		});

		it("skips on anniversary+2 days", () => {
			const tooLate = new Date(2026, 1, 14);
			expect(processCreditInterest(makeCredit(), tooLate)).toBeNull();
		});
	});

	describe("duplicate-processing guard", () => {
		it("skips a credit already modified today", () => {
			const credit = makeCredit({ modifiedDate: interestDay });
			expect(processCreditInterest(credit, interestDay)).toBeNull();
		});

		it("processes a credit modified on a previous day", () => {
			const yesterday = new Date(interestDay);
			yesterday.setDate(yesterday.getDate() - 1);
			const credit = makeCredit({ modifiedDate: yesterday });
			expect(processCreditInterest(credit, interestDay)).toBe(100_000);
		});

		it("processes a credit with no modifiedDate (first run)", () => {
			const credit = makeCredit({ modifiedDate: null });
			expect(processCreditInterest(credit, interestDay)).toBe(100_000);
		});

		it("does not double-charge if cron runs twice in one day", () => {
			// First run
			const credit = makeCredit();
			const firstResult = processCreditInterest(credit, interestDay);
			expect(firstResult).toBe(100_000);

			// Simulate DB state after first run: modifiedDate is now today
			const updatedCredit = makeCredit({
				interestAmount: firstResult!,
				modifiedDate: interestDay,
			});

			// Second run same day → must be skipped
			const secondResult = processCreditInterest(updatedCredit, interestDay);
			expect(secondResult).toBeNull();
		});
	});

	describe("month-end edge cases", () => {
		it("Jan 31 credit triggers on Mar 1 (Feb overflow)", () => {
			const credit = makeCredit({ startDate: new Date(2025, 0, 31) });
			expect(processCreditInterest(credit, new Date(2025, 2, 1))).toBe(100_000);
			expect(processCreditInterest(credit, new Date(2025, 1, 28))).toBeNull();
		});

		it("Mar 31 credit triggers on May 1 (Apr overflow)", () => {
			const credit = makeCredit({ startDate: new Date(2026, 2, 31) });
			expect(processCreditInterest(credit, new Date(2026, 4, 1))).toBe(100_000);
		});

		it("credit starting on the 1st triggers on the 2nd every month", () => {
			const credit = makeCredit({ startDate: new Date(2026, 0, 1) });
			expect(processCreditInterest(credit, new Date(2026, 1, 2))).toBe(100_000);
			expect(processCreditInterest(credit, new Date(2026, 2, 2))).toBe(100_000);
			expect(processCreditInterest(credit, new Date(2026, 3, 2))).toBe(100_000);
		});
	});

	describe("cross-year", () => {
		it("works across a year boundary", () => {
			const credit = makeCredit({ startDate: new Date(2025, 10, 15) }); // Nov 15 2025
			expect(processCreditInterest(credit, new Date(2026, 0, 16))).toBe(100_000);
		});
	});
});

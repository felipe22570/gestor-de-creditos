import { describe, it, expect } from "vitest";
import { calculateInterest } from "../utils";

describe("calculateInterest", () => {
	it("calculates 10% interest on 1,000,000", () => {
		expect(calculateInterest(1000000, 10)).toBe(100000);
	});

	it("calculates 5% interest on 500,000", () => {
		expect(calculateInterest(500000, 5)).toBe(25000);
	});

	it("floors the result (no decimals)", () => {
		expect(calculateInterest(333333, 10)).toBe(33333);
	});

	it("returns 0 for 0% interest rate", () => {
		expect(calculateInterest(1000000, 0)).toBe(0);
	});

	it("returns 0 for 0 capital", () => {
		expect(calculateInterest(0, 10)).toBe(0);
	});

	it("handles fractional interest rates", () => {
		expect(calculateInterest(1000000, 7.5)).toBe(75000);
	});
});

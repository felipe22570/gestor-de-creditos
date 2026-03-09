import { describe, it, expect } from "vitest";
import { formatCOP } from "../utils";

describe("formatCOP", () => {
	it("formats a positive number as Colombian Peso", () => {
		const result = formatCOP(1000000);
		expect(result).toContain("$");
		expect(result).toMatch(/1\.000\.000/);
	});

	it("formats zero", () => {
		expect(formatCOP(0)).toContain("0");
	});

	it("formats negative numbers", () => {
		const result = formatCOP(-500000);
		expect(result).toContain("500.000");
	});

	it("truncates decimals (minimumFractionDigits: 0)", () => {
		const result = formatCOP(1234);
		expect(result).toMatch(/1\.234/);
	});
});

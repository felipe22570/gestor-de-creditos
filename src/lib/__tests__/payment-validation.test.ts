import { describe, it, expect } from "vitest";

/**
 * These helper functions mirror the validation logic in the server actions
 * (src/lib/actions/payment.ts) to test the business rules without DB dependency.
 */

function validateCapitalPayment(amount: number, totalAmount: number, hasNextPaymentDate: boolean) {
	if (!hasNextPaymentDate) {
		throw new Error("No se puede pagar un crédito completado");
	}
	if (totalAmount <= 0) {
		throw new Error("El crédito ya está pagado completamente");
	}
	if (amount <= 0) {
		throw new Error("El monto debe ser mayor que cero");
	}
	if (amount > totalAmount) {
		throw new Error("El monto no puede ser mayor que el total adeudado");
	}
}

function validateInterestPayment(amount: number, hasNextPaymentDate: boolean) {
	if (!hasNextPaymentDate) {
		throw new Error("No se puede pagar un crédito completado");
	}
	if (amount <= 0) {
		throw new Error("El monto debe ser mayor que cero");
	}
}

function validateFullPayment(totalAmount: number, hasNextPaymentDate: boolean) {
	if (!hasNextPaymentDate) {
		throw new Error("No se puede pagar un crédito ya completado");
	}
	if (totalAmount <= 0) {
		throw new Error("El crédito ya está pagado completamente");
	}
}

function calculateFullPaymentAmount(totalAmount: number, interestAmount: number | null): number {
	return totalAmount + (interestAmount || 0);
}

describe("payment validation logic", () => {
	describe("capital payment validations", () => {
		it("rejects amount <= 0", () => {
			expect(() => validateCapitalPayment(0, 500000, true)).toThrow("mayor que cero");
			expect(() => validateCapitalPayment(-100, 500000, true)).toThrow("mayor que cero");
		});

		it("rejects amount > totalAmount (overpayment)", () => {
			expect(() => validateCapitalPayment(600000, 500000, true)).toThrow("mayor que el total");
		});

		it("accepts exact total amount", () => {
			expect(() => validateCapitalPayment(500000, 500000, true)).not.toThrow();
		});

		it("rejects if credit is already completed", () => {
			expect(() => validateCapitalPayment(100, 500000, false)).toThrow("completado");
		});

		it("rejects if totalAmount <= 0", () => {
			expect(() => validateCapitalPayment(100, 0, true)).toThrow("pagado completamente");
		});
	});

	describe("interest payment validations", () => {
		it("rejects amount <= 0", () => {
			expect(() => validateInterestPayment(0, true)).toThrow("mayor que cero");
		});

		it("rejects if credit is completed", () => {
			expect(() => validateInterestPayment(100, false)).toThrow("completado");
		});

		it("accepts valid amount", () => {
			expect(() => validateInterestPayment(50000, true)).not.toThrow();
		});
	});

	describe("full payment validations", () => {
		it("rejects if credit is completed", () => {
			expect(() => validateFullPayment(500000, false)).toThrow("completado");
		});

		it("rejects if totalAmount <= 0", () => {
			expect(() => validateFullPayment(0, true)).toThrow("pagado completamente");
		});

		it("accepts valid credit", () => {
			expect(() => validateFullPayment(500000, true)).not.toThrow();
		});
	});

	describe("full payment amount calculation", () => {
		it("includes capital + interest", () => {
			expect(calculateFullPaymentAmount(500000, 50000)).toBe(550000);
		});

		it("handles null/zero interest", () => {
			expect(calculateFullPaymentAmount(500000, 0)).toBe(500000);
			expect(calculateFullPaymentAmount(500000, null)).toBe(500000);
		});
	});
});

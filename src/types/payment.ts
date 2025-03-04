export interface PaymentRequest {
	adminId: number;
	clientId: number;
	creditId: number;
	creditName: string;
	amountPaid: number;
	startDate: Date;
	clientName: string;
	paymentType: "CAPITAL" | "INTEREST";
}

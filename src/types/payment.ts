export interface PaymentRequest {
	adminId: number;
	clientId: number;
	creditId: number;
	creditName: string;
	amountPaid: number;
	paymentDate: Date;
	clientName: string;
}

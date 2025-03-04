export interface CreditRequest {
	startDate: Date;
	clientCardId: number;
	adminId: number;
	clientName: string;
	clientPhone: string;
	productName: string;
	initialAmount: number;
	interestRate: number;
	totalAmount: number;
	numPayments?: number;
	nextPaymentDate?: Date;
	interestAmount?: number;
}

import { auth } from "@/auth.config";
import PageHeader from "@/components/dashboard/page-header";
import { fetchPayments } from "@/lib/actions/payment";

import PaymentsTable from "./table";

export default async function PaymentsPage() {
	const session = await auth();
	const payments = await fetchPayments(session?.user?.id as unknown as number);

	return (
		<div>
			<PageHeader
				title="Abonos Realizados"
				description="Historial de pagos de capital, interés y completos."
			/>
			<PaymentsTable data={payments} />
		</div>
	);
}

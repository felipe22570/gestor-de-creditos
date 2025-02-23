import { auth } from "@/auth.config";
import { fetchPayments } from "@/lib/actions/payment";
import PaymentsTable from "./table";

export default async function PaymentsPage() {
	const session = await auth();
	const payments = await fetchPayments(session?.user?.id as unknown as number);

	return (
		<div className="w-100">
			<h1 className="text-3xl my-3">Abonos Realizados</h1>
			<PaymentsTable data={payments} />
		</div>
	);
}

import { auth } from "@/auth.config";
import PageHeader from "@/components/dashboard/page-header";
import AddNewCreditModal from "@/components/modals/add-new-credit";
import { fetchCreditsDue } from "@/lib/actions/credit";

import CreditsDueTable from "./table";

export default async function CreditsDuePage() {
	const session = await auth();
	const credits = await fetchCreditsDue(session?.user?.id as unknown as number);

	return (
		<div>
			<PageHeader
				title="Créditos Vencidos"
				description="Créditos cuya próxima fecha de pago ya pasó."
				action={<AddNewCreditModal />}
			/>
			<CreditsDueTable data={credits} />
		</div>
	);
}

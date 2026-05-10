import { auth } from "@/auth.config";
import PageHeader from "@/components/dashboard/page-header";
import AddNewCreditModal from "@/components/modals/add-new-credit";
import { fetchActiveCredits } from "@/lib/actions/credit";

import CreditsActiveTable from "./table";

export default async function CreditsActivePage() {
	const session = await auth();
	const credits = await fetchActiveCredits(session?.user?.id as unknown as number);

	return (
		<div>
			<PageHeader
				title="Créditos Activos"
				description="Créditos con próxima fecha de pago programada."
				action={<AddNewCreditModal />}
			/>
			<CreditsActiveTable data={credits} />
		</div>
	);
}

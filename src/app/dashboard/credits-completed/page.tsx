import { auth } from "@/auth.config";
import PageHeader from "@/components/dashboard/page-header";
import { fetchCompletedCredits } from "@/lib/actions/credit";
import { fetchTotalRecaudadoForCompletedCredits } from "@/lib/actions/payment";

import CreditsCompletedTable from "./table";

export default async function CreditsCompletedPage() {
	const session = await auth();
	const adminId = session?.user?.id as unknown as number;
	const [credits, totalRecaudado] = await Promise.all([
		fetchCompletedCredits(adminId),
		fetchTotalRecaudadoForCompletedCredits(adminId),
	]);

	return (
		<div>
			<PageHeader
				title="Créditos Completados"
				description="Créditos pagados en su totalidad."
			/>
			<CreditsCompletedTable data={credits} totalRecaudado={totalRecaudado} />
		</div>
	);
}

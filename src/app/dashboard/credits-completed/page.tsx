import { auth } from "@/auth.config";
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
		<div className="w-full">
			<h1 className="text-3xl my-3">Créditos Completados</h1>
			<CreditsCompletedTable data={credits} totalRecaudado={totalRecaudado} />
		</div>
	);
}

import { auth } from "@/auth.config";
import { fetchCredits } from "@/lib/actions/credit";
import CreditsActiveTable from "./table";
import { Suspense } from "react";
import AddNewCreditModal from "@/components/modals/add-new-credit";

export default async function CreditsActivePage() {
	const session = await auth();

	const credits = await fetchCredits(session?.user?.id as unknown as number);

	return (
		<div className="w-100">
			<div className="flex justify-between items-center pr-5">
				<h1 className="text-3xl my-3">Créditos Activos</h1>
				<AddNewCreditModal />
			</div>

			<Suspense fallback={<div>Loading...</div>}>
				<CreditsActiveTable data={credits} />
			</Suspense>
		</div>
	);
}
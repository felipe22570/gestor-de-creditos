import { auth } from "@/auth.config";
import { fetchCreditsDue } from "@/lib/actions/credit";
import CreditsDueTable from "./table";
import AddNewCreditModal from "@/components/modals/add-new-credit";

export default async function CreditsDuePage() {
	const session = await auth();
	const credits = await fetchCreditsDue(session?.user?.id as unknown as number);

	return (
		<div className="w-100">
			<div className="flex justify-between items-center pr-5">
				<h1 className="text-3xl my-3">Créditos Vencidos</h1>
				<AddNewCreditModal />
			</div>
			<CreditsDueTable data={credits} />
		</div>
	);
}

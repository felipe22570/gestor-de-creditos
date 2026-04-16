import { auth } from "@/auth.config";
import { fetchActiveCredits } from "@/lib/actions/credit";
import CreditsActiveTable from "./table";
import AddNewCreditModal from "@/components/modals/add-new-credit";

export default async function CreditsActivePage() {
	const session = await auth();
	const credits = await fetchActiveCredits(session?.user?.id as unknown as number);

	return (
		<div className="w-full">
			<div className="flex justify-between items-center pr-5">
				<h1 className="text-3xl my-3">Créditos Activos</h1>
				<AddNewCreditModal />
			</div>
			<CreditsActiveTable data={credits} />
		</div>
	);
}

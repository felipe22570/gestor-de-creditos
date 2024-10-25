import { auth } from "@/auth.config";
import Sidebar from "@/components/dashboard/sidebar";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	return (
		<div className="flex">
			<Sidebar />
			<div className="w-full p-5">{children}</div>
		</div>
	);
}

import { auth } from "@/auth.config";
import dotenv from "dotenv";
import { redirect } from "next/navigation";
dotenv.config();

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
	const session = await auth();

	if (session?.user) {
		redirect("/dashboard");
	}

	return <div className="">{children}</div>;
}

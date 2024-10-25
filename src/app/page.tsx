import { auth } from "@/auth.config";
import { redirect } from "next/navigation";

export default async function Home() {
	const session = await auth();

	if (session?.user) {
		redirect("/dashboard");
	} else {
		redirect("/login");
	}

	return <div>Hola Mundo!</div>;
}

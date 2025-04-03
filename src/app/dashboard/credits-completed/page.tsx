"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchCompletedCredits } from "@/lib/actions/credit";
import CreditsCompletedTable from "./table";
import { Credit } from "@/types/schema";

export default function CreditsCompletedPage() {
	const { data: session } = useSession();
	const [credits, setCredits] = useState<Credit[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadCredits = async () => {
			if (session?.user?.id) {
				const completedCredits = await fetchCompletedCredits(Number(session.user.id));
				setCredits(completedCredits);
			}
			setLoading(false);
		};

		loadCredits();
	}, [session?.user?.id]);

	if (loading) {
		return <div>Cargando...</div>;
	}

	return (
		<div>
			<h1 className="text-3xl my-3">Créditos Completados</h1>
			<CreditsCompletedTable data={credits} />
		</div>
	);
}

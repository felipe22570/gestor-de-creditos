import PageHeader from "@/components/dashboard/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div>
			<PageHeader
				title="Créditos Vencidos"
				description="Créditos cuya próxima fecha de pago ya pasó."
			/>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<Skeleton className="h-28 w-full rounded-card" />
				<Skeleton className="h-28 w-full rounded-card" />
			</div>
			<div className="mt-8 space-y-4">
				<Skeleton className="h-10 w-full max-w-sm" />
				<Skeleton className="h-96 w-full rounded-card" />
			</div>
		</div>
	);
}

import PageHeader from "@/components/dashboard/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentsLoading() {
	return (
		<div>
			<PageHeader
				title="Abonos Realizados"
				description="Historial de pagos de capital, interés y completos."
			/>
			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				<Skeleton className="h-28 w-full rounded-card" />
				<Skeleton className="h-28 w-full rounded-card" />
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

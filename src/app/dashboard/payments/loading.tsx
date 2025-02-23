import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentsLoading() {
	return (
		<div className="w-100">
			<h1 className="text-3xl my-3">
				<Skeleton className="h-9 w-48" />
			</h1>

			<div className="rounded-md border">
				{/* Table header skeleton */}
				<div className="border-b px-4 py-3 bg-muted/50">
					<Skeleton className="h-6 w-full" />
				</div>

				{/* Table rows skeleton */}
				{[...Array(5)].map((_, index) => (
					<div key={index} className="border-b px-4 py-4">
						<Skeleton className="h-5 w-full" />
					</div>
				))}
			</div>
		</div>
	);
}

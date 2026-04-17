import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="w-full">
			<h1 className="text-3xl my-3">Créditos Completados</h1>
			<div className="space-y-4">
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-96 w-full" />
			</div>
		</div>
	);
}

import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="w-100">
			<div className="flex justify-between items-center pr-5">
				<h1 className="text-3xl my-3">Créditos Vencidos</h1>
			</div>
			<div className="space-y-4">
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-96 w-full" />
			</div>
		</div>
	);
}

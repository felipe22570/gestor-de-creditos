import { Button } from "@/components/ui/button";

export default function Loading() {
	return (
		<div className="w-100">
			<div className="flex justify-between items-center pr-5">
				<h1 className="text-3xl my-3">Créditos Activos</h1>
				<Button variant="default">Agregar Nuevo Crédito</Button>
			</div>
			<h2 className="text-lg text-gray-600 my-5">Cargando...</h2>
		</div>
	);
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteCredit } from "@/lib/actions/credit";

interface Props {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	creditId: number;
}

export default function DeleteCreditModal({ isOpen, setIsOpen, creditId }: Props) {
	const { toast } = useToast();
	const router = useRouter();
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDeleteCredit = async () => {
		setIsDeleting(true);
		try {
			await deleteCredit(creditId);

			toast({
				title: "Crédito eliminado exitosamente",
				variant: "success",
				duration: 1500,
			});
			setIsOpen(false);
			router.refresh();
		} catch (error) {
			console.error(error);

			toast({
				title: "Error al eliminar el crédito",
				variant: "destructive",
				duration: 1500,
			});
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Eliminar Crédito</AlertDialogTitle>
					<AlertDialogDescription>
						¿Estás seguro de que deseas eliminar este crédito? Esta acción también borrará
						todos los pagos asociados y es irreversible.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-none focus-visible:shadow-[0_0_0_3px_rgba(239,68,68,0.18)]"
						onClick={handleDeleteCredit}
						disabled={isDeleting}
					>
						{isDeleting ? "Eliminando..." : "Borrar"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

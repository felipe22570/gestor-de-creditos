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
import { useRouter } from "next/navigation";

interface Props {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	creditId: number;
}

export default function DeleteCreditModal({ isOpen, setIsOpen, creditId }: Props) {
	const { toast } = useToast();

	const router = useRouter();

	const handleDeleteCredit = async () => {
		try {
			await deleteCredit(creditId);

			toast({
				title: "Credito eliminado exitosamente",
				variant: "success",
				duration: 1500,
			});
		} catch (error) {
			console.error(error);

			toast({
				title: "Error al eliminar el credito",
				variant: "destructive",
				duration: 1500,
			});
		} finally {
			setIsOpen(false);
			router.refresh();
		}
	};

	return (
		<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Eliminar Crédito</AlertDialogTitle>
					<AlertDialogDescription>
						Estás seguro de que deseas eliminar este elemento?
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						className="bg-red-500 focus:bg-red-600"
						onClick={handleDeleteCredit}
					>
						Borrar
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

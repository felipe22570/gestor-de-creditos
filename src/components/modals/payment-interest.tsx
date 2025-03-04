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
import { formatCOP } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Credit } from "@/types/schema";
import { createInterestPayment } from "@/lib/actions/payment";
import { Checkbox } from "../ui/checkbox";
import { useState } from "react";

interface Props {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	credit: Credit | null;
}

export default function PaymentInterestModal({ isOpen, setIsOpen, credit }: Props) {
	const { toast } = useToast();
	const router = useRouter();

	const [addNewInterest, setAddNewInterest] = useState(false);

	const interestAmount = credit?.interestAmount ?? 0;

	const onAddInterest = async () => {
		await createInterestPayment(credit as Credit, interestAmount, addNewInterest);

		toast({
			variant: "success",
			title: "Interés abonado exitosamente",
			description: "El interés ha sido abonado correctamente",
		});

		setIsOpen(false);
		router.refresh();
	};

	const onAddNewInterest = (value: boolean) => {
		setAddNewInterest(value);
	};

	return (
		<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Abonar interés</AlertDialogTitle>
					<AlertDialogDescription>
						<span>
							Estás seguro de que deseas abonar valor de interés a{" "}
							<i>{credit?.productName}</i> por valor de{" "}
							<b>{formatCOP(interestAmount)}</b>?
						</span>

						<div className="flex items-center space-x-2 mt-4 mb-7">
							<Checkbox
								id="interest"
								checked={addNewInterest}
								onCheckedChange={onAddNewInterest}
							/>
							<label
								htmlFor="interest"
								className="mt-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								Agregar interés a la fecha actual
							</label>
						</div>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						className="bg-emerald-500 focus:bg-emerald-600"
						onClick={onAddInterest}
					>
						Abonar
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

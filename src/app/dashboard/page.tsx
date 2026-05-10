import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AlertTriangleIcon, CheckCircleIcon, CoinsIcon, ListChecksIcon } from "lucide-react";
import Link from "next/link";

import { auth } from "@/auth.config";
import PageHeader from "@/components/dashboard/page-header";
import StatCard from "@/components/dashboard/stat-card";
import { Chip } from "@/components/ui/chip";
import {
	fetchActiveCredits,
	fetchCompletedCredits,
	fetchCreditsDue,
} from "@/lib/actions/credit";
import { fetchPayments, fetchTotalRecaudadoForCompletedCredits } from "@/lib/actions/payment";
import { formatCOP } from "@/lib/utils";

const paymentTypeLabels: Record<string, string> = {
	CAPITAL: "Capital",
	INTEREST: "Interés",
	FULL: "Pago Completo",
};

export default async function DashboardPage() {
	const session = await auth();
	const adminId = session?.user?.id as unknown as number;
	const userName = session?.user?.name?.split(" ")[0];

	const [activeCredits, dueCredits, completedCredits, allPayments, totalRecaudado] = await Promise.all([
		fetchActiveCredits(adminId),
		fetchCreditsDue(adminId),
		fetchCompletedCredits(adminId),
		fetchPayments(adminId),
		fetchTotalRecaudadoForCompletedCredits(adminId),
	]);

	const totalOutstanding = activeCredits.reduce((sum, credit) => {
		const capital = Number(credit.totalAmount) || 0;
		const interest = credit.interestAmount ? Number(credit.interestAmount) : 0;
		return sum + capital + interest;
	}, 0);

	const totalCapitalLent = activeCredits.reduce(
		(sum, credit) => sum + (Number(credit.initialAmount) || 0),
		0
	);

	const recentPayments = [...allPayments]
		.sort((a, b) => {
			const aDate = a.startDate ? new Date(a.startDate as unknown as string).getTime() : 0;
			const bDate = b.startDate ? new Date(b.startDate as unknown as string).getTime() : 0;
			return bDate - aDate;
		})
		.slice(0, 5);

	return (
		<div>
			<PageHeader
				title={userName ? `Hola, ${userName}` : "Inicio"}
				description="Resumen de tu cartera de créditos y pagos recientes."
			/>

			<section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<StatCard
					label="Créditos activos"
					value={activeCredits.length}
					icon={ListChecksIcon}
					tone="success"
					hint={
						totalCapitalLent > 0
							? `${formatCOP(totalCapitalLent)} prestado`
							: undefined
					}
				/>
				<StatCard
					label="Créditos vencidos"
					value={dueCredits.length}
					icon={AlertTriangleIcon}
					tone="destructive"
					hint={
						dueCredits.length > 0 ? "Requieren seguimiento" : "Todo al día"
					}
				/>
				<StatCard
					label="Total por cobrar"
					value={formatCOP(totalOutstanding)}
					icon={CoinsIcon}
					tone="info"
					hint={`${activeCredits.length} créditos activos`}
				/>
				<StatCard
					label="Total recaudado"
					value={formatCOP(totalRecaudado)}
					icon={CheckCircleIcon}
					tone="default"
					hint={`${completedCredits.length} créditos completados`}
				/>
			</section>

			<section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
				<div className="rounded-card border border-border bg-surface lg:col-span-2">
					<div className="flex items-center justify-between border-b border-border px-6 py-4">
						<div>
							<h2 className="font-display text-subhead font-semibold tracking-heading-tight text-foreground">
								Pagos recientes
							</h2>
							<p className="text-small text-text-secondary">
								Últimos 5 abonos registrados
							</p>
						</div>
						<Link
							href="/dashboard/payments"
							className="text-small font-medium text-primary hover:text-primary-hover"
						>
							Ver todos →
						</Link>
					</div>
					{recentPayments.length === 0 ? (
						<div className="flex items-center justify-center p-10 text-small text-text-secondary">
							Aún no hay pagos registrados
						</div>
					) : (
						<ul className="divide-y divide-border">
							{recentPayments.map((payment) => {
								const date = payment.startDate
									? format(new Date(payment.startDate as unknown as string), "d MMM yyyy", {
											locale: es,
									  })
									: "—";
								const chipVariant =
									payment.paymentType === "CAPITAL"
										? "active"
										: payment.paymentType === "INTEREST"
										? "warning"
										: "success";

								return (
									<li
										key={payment.id}
										className="flex items-center justify-between gap-4 px-6 py-4"
									>
										<div className="min-w-0 flex-1">
											<p className="truncate text-small font-medium text-foreground">
												{payment.clientName ?? "Sin nombre"}
											</p>
											<p className="truncate text-caption text-text-secondary">
												{payment.creditName ?? "—"} · {date}
											</p>
										</div>
										<div className="flex shrink-0 items-center gap-3">
											<Chip variant={chipVariant} size="sm">
												{paymentTypeLabels[payment.paymentType ?? ""] ?? "Otro"}
											</Chip>
											<span className="font-mono text-small font-semibold tabular-nums text-foreground">
												{formatCOP(payment.amountPaid ?? 0)}
											</span>
										</div>
									</li>
								);
							})}
						</ul>
					)}
				</div>

				<div className="rounded-card border border-border bg-surface">
					<div className="border-b border-border px-6 py-4">
						<h2 className="font-display text-subhead font-semibold tracking-heading-tight text-foreground">
							Atajos
						</h2>
						<p className="text-small text-text-secondary">Navega a tus listas</p>
					</div>
					<nav className="flex flex-col p-3">
						<DashboardLink
							href="/dashboard/credits-active"
							label="Créditos activos"
							count={activeCredits.length}
							tone="success"
						/>
						<DashboardLink
							href="/dashboard/credits-due"
							label="Créditos vencidos"
							count={dueCredits.length}
							tone="destructive"
						/>
						<DashboardLink
							href="/dashboard/credits-completed"
							label="Créditos completados"
							count={completedCredits.length}
							tone="muted"
						/>
						<DashboardLink
							href="/dashboard/payments"
							label="Abonos"
							count={allPayments.length}
							tone="muted"
						/>
					</nav>
				</div>
			</section>
		</div>
	);
}

function DashboardLink({
	href,
	label,
	count,
	tone,
}: {
	href: string;
	label: string;
	count: number;
	tone: "success" | "destructive" | "muted";
}) {
	const chipVariant = tone === "success" ? "ontrack" : tone === "destructive" ? "overdue" : "default";

	return (
		<Link
			href={href}
			className="flex items-center justify-between rounded-md px-3 py-2.5 text-small font-medium text-text-secondary transition-colors hover:bg-muted hover:text-foreground"
		>
			<span>{label}</span>
			<Chip variant={chipVariant} size="sm">
				{count}
			</Chip>
		</Link>
	);
}

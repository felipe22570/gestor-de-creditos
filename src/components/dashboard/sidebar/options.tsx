import CautionIcon from "@/components/icons/caution";
import CheckListIcon from "@/components/icons/check-list";
import CoinIcon from "@/components/icons/coin";
import HomeIcon from "@/components/icons/home";
import Link from "next/link";

const options = [
	{
		name: "Inicio",
		href: "/dashboard/",
		icon: <HomeIcon className="w-5 h-5" />,
	},
	{
		name: "Créditos Activos",
		href: "/dashboard/credits-active",
		icon: <CheckListIcon className="w-5 h-5 text-green-700" />,
	},
	{
		name: "Créditos Vencidos",
		href: "/dashboard/credits-due",
		icon: <CautionIcon className="w-5 h-5 text-red-500" />,
	},
	{
		name: "Abonos",
		href: "/dashboard/payments",
		icon: <CoinIcon className="w-5 h-5" />,
	},
];

export default function DashboardSidebarOptions() {
	return (
		<div>
			{options.map((option) => (
				<li key={option.name}>
					<Link
						href={option.href}
						className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
					>
						<span className="inline-flex justify-center items-center ml-4">
							{option.icon}
						</span>
						<span className="ml-2 text-sm tracking-wide truncate">{option.name}</span>
					</Link>
				</li>
			))}
		</div>
	);
}

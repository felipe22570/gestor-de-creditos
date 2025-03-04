import SignOut from "@/components/sign-out";
import DashboardSidebarOptions from "./options";

export default function Sidebar() {
	return (
		<div className="min-h-screen flex flex-col flex-shrink-0 antialiased bg-gray-50 text-gray-800">
			<div className="flex flex-col top-0 left-0 w-52 bg-white h-full border-r">
				<div className="flex items-center justify-center h-14 border-b">
					<div>Gestor de Créditos</div>
				</div>
				<div className="h-full overflow-y-auto overflow-x-hidden flex-grow">
					<ul className="h-full flex flex-col py-4 space-y-1">
						<li className="px-5">
							<div className="flex flex-row items-center h-8">
								<div className="text-sm font-light tracking-wide text-gray-500">
									Menu
								</div>
							</div>
						</li>

						<div className="h-full flex flex-col justify-between">
							<DashboardSidebarOptions />
							<div className="">
								<li>
									<a
										href="#"
										className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
									>
										<span className="inline-flex justify-center items-center ml-4">
											<svg
												className="w-5 h-5"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
												></path>
											</svg>
										</span>
										<span className="ml-2 text-sm tracking-wide truncate">
											Perfil
										</span>
									</a>
								</li>
								<li>
									<a
										href="#"
										className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
									>
										<span className="inline-flex justify-center items-center ml-4">
											<svg
												className="w-5 h-5"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
												></path>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
												></path>
											</svg>
										</span>
										<span className="ml-2 text-sm tracking-wide truncate">
											Configuración
										</span>
									</a>
								</li>
								<li className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6">
									<span className="ml-2 text-sm tracking-wide truncate">
										<SignOut />
									</span>
								</li>
							</div>
						</div>
					</ul>
				</div>
			</div>
		</div>
	);
}

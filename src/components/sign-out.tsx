"use client";

import { logout } from "@/lib/actions/admin";
import { Button } from "./ui/button";

export default function SignOut() {
	const onLogout = async () => {
		"use server";
		await logout();

		window.location.replace("/login");
	};

	return (
		<div className="ml-2">
			<Button onClick={onLogout}>
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
						d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
					></path>
				</svg>
				<span className="ml-2">Salir</span>
			</Button>
		</div>
	);
}

import { DefaultSession } from "next-auth";

declare module "next-auth" {
	interface User {
		id: string;
		name: string;
		email: string;
		phone: string;
		balance: number;
	}

	interface Session extends DefaultSession {
		user?: User;
	}
}

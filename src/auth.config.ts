import NextAuth, { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import db from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { fetchUser } from "./lib/actions/admin";

export const authConfig: NextAuthConfig = {
	pages: {
		signIn: "/login",
		newUser: "/register",
	},
	callbacks: {
		async session({ session }) {
			const admin = await fetchUser(session?.user?.email as string);

			if (!admin) return session;

			session.user = {
				id: admin.id as unknown as string,
				name: admin?.name,
				email: admin?.email,
				emailVerified: null,
				phone: admin?.phone,
				balance: admin?.balance as number,
			};
			return session;
		},
	},
	providers: [
		Credentials({
			async authorize(credentials) {
				const parsedCredentials = z
					.object({
						email: z.string().email(),
						password: z.string(),
					})
					.safeParse(credentials);

				if (!parsedCredentials.success) {
					return null;
				}

				const { email, password } = parsedCredentials.data;

				const user = await db.select().from(users).where(eq(users.email, email));

				if (!user) return null;

				if (!bcrypt.compareSync(password, user[0].password)) return null;

				return {
					id: user[0].id as unknown as string,
					name: user[0].name as string,
					email: user[0].email as string,
					phone: user[0].phone as string,
					balance: user[0].balance as number,
				};
			},
		}),
	],
};

export const { signIn, signOut, auth, handlers } = NextAuth(authConfig);

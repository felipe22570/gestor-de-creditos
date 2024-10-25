"use server";

import { signIn, signOut } from "@/auth.config";
import db from "@/db";
import { users } from "@/db/schema";
import { UserAdmin } from "@/types/user";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

// RegisterUser

export async function registerUser({ name, email, phone, password }: UserAdmin) {
	try {
		const passwordHash = bcrypt.hashSync(password, 10);

		await db.insert(users).values({
			name,
			email,
			phone,
			password: passwordHash,
			balance: 0,
		});
	} catch (error) {
		console.error(error);
	}
}

// LoginUser

export async function login({ email, password }: { email: string; password: string }) {
	try {
		await signIn("credentials", {
			email,
			password,
		});
	} catch (error) {
		console.error(error);
	}
}

// LogoutUser

export async function logout() {
	try {
		await signOut();
	} catch (error) {
		console.error(error);
	}
}

export async function fetchUser(email: string): Promise<UserAdmin | null> {
	try {
		const user = await db.select().from(users).where(eq(users.email, email));

		return user[0] as UserAdmin;
	} catch (error) {
		console.error(error);

		return null;
	}
}

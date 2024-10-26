import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";
dotenv.config();

const url = process.env.DATABASE_URL?.trim();
if (!url) {
	throw new Error("DATABASE_URL is not set");
}

const authToken = process.env.DATABASE_AUTH_TOKEN?.trim();
if (!authToken) {
	throw new Error("DATABASE_AUTH_TOKEN is not set");
}

const client = createClient({
	url,
	authToken,
});

const db = drizzle(client);

export default db;

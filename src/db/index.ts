import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";
dotenv.config();

const client = createClient({
	url: (process.env.DATABASE_URL as string) || "",
	authToken: (process.env.DATABASE_AUTH_TOKEN as string) || "",
});

const db = drizzle(client);

export default db;

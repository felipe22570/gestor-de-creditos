import { sql } from "drizzle-orm";
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
	id: integer("id", { mode: "number" }).notNull().primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	email: text("email").notNull(),
	password: text("password").notNull(),
	phone: text("phone").notNull(),
	balance: integer("balance").notNull().default(0),
});

export const credits = sqliteTable("credits", {
	id: integer("id", { mode: "number" }).notNull().primaryKey({ autoIncrement: true }),
	adminId: integer("admin_id")
		.references(() => users.id)
		.notNull(),
	clientCardId: integer("client_card__id").notNull(),
	clientName: text("client_name").notNull(),
	clientPhone: text("client_phone").notNull(),
	productName: text("product_name").notNull(),
	initialAmount: integer("initial_amount").notNull(),
	interestRate: integer("interest_rate").notNull(),
	totalAmount: integer("total_amount").notNull(),
	startDate: integer("start_date", { mode: "timestamp" }).default(sql`(strftime('%s','now'))`),
	modifiedDate: integer("modified_date", { mode: "timestamp" }).default(sql`(strftime('%s','now'))`),
	nextPaymentDate: integer("next_payment_date", { mode: "timestamp" }),
	numPayments: integer("num_payments"),
});

export const payments = sqliteTable("payments", {
	id: integer("id", { mode: "number" }).notNull().primaryKey({ autoIncrement: true }),
	admin_id: integer("admin_id")
		.references(() => users.id)
		.notNull(),
	credit_id: integer("credit_id")
		.references(() => credits.id)
		.notNull(),
	client_id: integer("client_id"),
	payment_date: integer("start_date", { mode: "timestamp" }),
	amount_paid: integer("amount_paid"),
});

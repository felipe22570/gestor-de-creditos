CREATE TABLE `credits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`admin_id` integer NOT NULL,
	`client_card__id` integer NOT NULL,
	`client_name` text NOT NULL,
	`client_phone` text NOT NULL,
	`product_name` text NOT NULL,
	`initial_amount` integer NOT NULL,
	`interest_rate` integer NOT NULL,
	`total_amount` integer NOT NULL,
	`start_date` integer DEFAULT (strftime('%s','now')),
	`modified_date` integer DEFAULT (strftime('%s','now')),
	`num_payments` integer,
	FOREIGN KEY (`admin_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`admin_id` integer NOT NULL,
	`credit_id` integer NOT NULL,
	`client_id` integer,
	`start_date` integer,
	`amount_paid` integer,
	FOREIGN KEY (`admin_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`credit_id`) REFERENCES `credits`(`id`) ON UPDATE no action ON DELETE no action
);

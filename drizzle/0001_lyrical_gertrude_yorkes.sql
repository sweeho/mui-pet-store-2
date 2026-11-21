CREATE TABLE `audit_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` text NOT NULL,
	`action` text NOT NULL,
	`detail` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `category` (
	`id` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE `category_details` (
	`category_id` text NOT NULL,
	`locale` text NOT NULL,
	`name` text NOT NULL,
	`image` text,
	`description` text,
	PRIMARY KEY(`category_id`, `locale`),
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `item` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `item_details` (
	`item_id` text NOT NULL,
	`locale` text NOT NULL,
	`image` text NOT NULL,
	`description` text NOT NULL,
	`list_price` real NOT NULL,
	`unit_cost` real NOT NULL,
	`attr1` text,
	`attr2` text,
	`attr3` text,
	`attr4` text,
	`attr5` text,
	PRIMARY KEY(`item_id`, `locale`),
	FOREIGN KEY (`item_id`) REFERENCES `item`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `product` (
	`id` text PRIMARY KEY NOT NULL,
	`category_id` text NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `product_details` (
	`product_id` text NOT NULL,
	`locale` text NOT NULL,
	`name` text NOT NULL,
	`image` text,
	`description` text,
	PRIMARY KEY(`product_id`, `locale`),
	FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`attributes` text DEFAULT '{}' NOT NULL,
	`controller_state` text DEFAULT '{}' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);

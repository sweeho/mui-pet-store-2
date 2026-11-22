CREATE TABLE `account` (
	`user_name` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `contact_info` (
	`user_name` text PRIMARY KEY NOT NULL,
	`family_name` text,
	`given_name` text,
	`email` text,
	`telephone` text,
	`street1` text,
	`street2` text,
	`city` text,
	`state` text,
	`zip` text,
	`country` text
);
--> statement-breakpoint
CREATE TABLE `credit_card` (
	`user_name` text PRIMARY KEY NOT NULL,
	`number` text,
	`type` text,
	`expiry` text
);
--> statement-breakpoint
CREATE TABLE `customer` (
	`user_name` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE `profile` (
	`user_name` text PRIMARY KEY NOT NULL,
	`language` text DEFAULT 'en_US' NOT NULL,
	`favorite_category` text,
	`my_list` integer DEFAULT true NOT NULL,
	`banner` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `signon` (
	`user_name` text PRIMARY KEY NOT NULL,
	`password_hash` text NOT NULL,
	`session_version` integer DEFAULT 0 NOT NULL,
	`failed_attempts` integer DEFAULT 0 NOT NULL,
	`locked_until` integer,
	`created_at` integer NOT NULL
);

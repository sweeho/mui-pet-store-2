CREATE INDEX `category_details_locale_name_idx` ON `category_details` (`locale`,`name`);--> statement-breakpoint
CREATE INDEX `item_product_id_idx` ON `item` (`product_id`);--> statement-breakpoint
CREATE INDEX `product_category_id_idx` ON `product` (`category_id`);--> statement-breakpoint
CREATE INDEX `product_details_locale_name_idx` ON `product_details` (`locale`,`name`);
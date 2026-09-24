ALTER TABLE `inventory` ADD `item_code` text;--> statement-breakpoint
ALTER TABLE `inventory` ADD `lot` text;--> statement-breakpoint
ALTER TABLE `inventory` ADD `expiry_date` text;--> statement-breakpoint
ALTER TABLE `inventory` ADD `product_code` text;--> statement-breakpoint
ALTER TABLE `inventory` ADD `unit_code` text;--> statement-breakpoint
ALTER TABLE `inventory` ADD `unit_name` text;--> statement-breakpoint
ALTER TABLE `inventory` ADD `retail_price` real;--> statement-breakpoint
ALTER TABLE `inventory` ADD `discount_percent` real;--> statement-breakpoint
ALTER TABLE `inventory` ADD `discount_po` real;--> statement-breakpoint
ALTER TABLE `inventory` ADD `discount_so` real;--> statement-breakpoint
ALTER TABLE `inventory` ADD `discount_pcc` real;--> statement-breakpoint
ALTER TABLE `inventory` ADD `discount_fair` real;--> statement-breakpoint
ALTER TABLE `inventory` ADD `net_price` real;--> statement-breakpoint
ALTER TABLE `inventory` ADD `line_amount` real;--> statement-breakpoint
ALTER TABLE `inventory` ADD `source_file` text;
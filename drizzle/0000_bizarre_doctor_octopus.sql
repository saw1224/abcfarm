CREATE TABLE `inventory` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`dose` text NOT NULL,
	`presentation` text NOT NULL,
	`brand` text DEFAULT 'Genérico' NOT NULL,
	`stock` integer DEFAULT 0 NOT NULL,
	`sale_price` real NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_inventory_owner_product` ON `inventory` (`owner_id`,`name`,`dose`,`presentation`);
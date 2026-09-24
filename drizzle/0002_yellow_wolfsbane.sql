CREATE TABLE `pharmacy_sources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_id` text NOT NULL,
	`source_key` text NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_pharmacy_sources_owner_key` ON `pharmacy_sources` (`owner_id`,`source_key`);
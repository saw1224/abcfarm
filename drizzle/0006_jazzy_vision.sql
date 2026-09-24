ALTER TABLE `app_users` ADD `password_salt` text;--> statement-breakpoint
ALTER TABLE `app_users` ADD `password_hash` text;
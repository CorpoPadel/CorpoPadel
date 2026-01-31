ALTER TABLE `players` ADD `email` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `players_email_unique` ON `players` (`email`);
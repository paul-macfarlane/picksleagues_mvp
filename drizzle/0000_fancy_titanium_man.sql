CREATE TABLE `countries` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `nameIdx` ON `countries` (`name`);
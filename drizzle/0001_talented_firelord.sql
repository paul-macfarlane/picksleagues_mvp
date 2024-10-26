CREATE TABLE `league_members` (
	`user_id` text NOT NULL,
	`league_id` text NOT NULL,
	`role` text(64) NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`league_id`) REFERENCES `leagues`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `league_seasons` (
	`id` text PRIMARY KEY NOT NULL,
	`league_id` text NOT NULL,
	`sport_season_id` text NOT NULL,
	`start_sport_week_id` text NOT NULL,
	`end_sport_week_id` text NOT NULL,
	`active` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`league_id`) REFERENCES `leagues`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`sport_season_id`) REFERENCES `sport_seasons`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`start_sport_week_id`) REFERENCES `sport_weeks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`end_sport_week_id`) REFERENCES `sport_weeks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `leagues` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text(256) NOT NULL,
	`logo_url` text,
	`sport_id` text NOT NULL,
	`picks_per_week` integer NOT NULL,
	`pick_type` text(64) NOT NULL,
	`league_visibility` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`sport_id`) REFERENCES `sports`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sport_seasons` (
	`id` text PRIMARY KEY NOT NULL,
	`sport_id` text NOT NULL,
	`name` text(256) NOT NULL,
	`start_time` integer NOT NULL,
	`end_time` integer NOT NULL,
	`active` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`sport_id`) REFERENCES `sports`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sport_weeks` (
	`id` text PRIMARY KEY NOT NULL,
	`season_id` text NOT NULL,
	`name` text(256) NOT NULL,
	`start_time` integer NOT NULL,
	`end_time` integer NOT NULL,
	`default_start` integer DEFAULT false NOT NULL,
	`default_end` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`season_id`) REFERENCES `sport_seasons`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sports` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text(256) NOT NULL,
	`order` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);

CREATE TABLE `picks_league_standings` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`user_id` text(36) NOT NULL,
	`season_id` text NOT NULL,
	`wins` integer NOT NULL,
	`losses` integer NOT NULL,
	`pushes` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`season_id`) REFERENCES `picks_league_seasons`(`id`) ON UPDATE no action ON DELETE cascade
);

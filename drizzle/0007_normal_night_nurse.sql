PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_picks_league_standings` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`user_id` text(36) NOT NULL,
	`season_id` text NOT NULL,
	`wins` integer DEFAULT 0 NOT NULL,
	`losses` integer DEFAULT 0 NOT NULL,
	`pushes` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`season_id`) REFERENCES `picks_league_seasons`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_picks_league_standings`("id", "user_id", "season_id", "wins", "losses", "pushes", "created_at", "updated_at") SELECT "id", "user_id", "season_id", "wins", "losses", "pushes", "created_at", "updated_at" FROM `picks_league_standings`;--> statement-breakpoint
DROP TABLE `picks_league_standings`;--> statement-breakpoint
ALTER TABLE `__new_picks_league_standings` RENAME TO `picks_league_standings`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
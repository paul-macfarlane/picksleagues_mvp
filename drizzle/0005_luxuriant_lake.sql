PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_picks_league_picks` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`user_id` text(36) NOT NULL,
	`league_id` text(36) NOT NULL,
	`sport_league_week_id` text(36) NOT NULL,
	`sport_league_game_id` text(36) NOT NULL,
	`type` text(32) NOT NULL,
	`team_id` text(36) NOT NULL,
	`spread` real,
	`favorite` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`league_id`) REFERENCES `picks_leagues`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`sport_league_week_id`) REFERENCES `sport_league_weeks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`sport_league_game_id`) REFERENCES `sport_league_games`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`team_id`) REFERENCES `sport_league_teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_picks_league_picks`("id", "user_id", "league_id", "sport_league_week_id", "sport_league_game_id", "type", "team_id", "spread", "favorite", "created_at", "updated_at") SELECT "id", "user_id", "league_id", "sport_league_week_id", "sport_league_game_id", "type", "team_id", "spread", "favorite", "created_at", "updated_at" FROM `picks_league_picks`;--> statement-breakpoint
DROP TABLE `picks_league_picks`;--> statement-breakpoint
ALTER TABLE `__new_picks_league_picks` RENAME TO `picks_league_picks`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_sport_league_weeks` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`season_id` text(36) NOT NULL,
	`name` text(32) NOT NULL,
	`start_time` integer NOT NULL,
	`end_time` integer NOT NULL,
	`espn_events_ref` text,
	`type` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`season_id`) REFERENCES `sport_league_seasons`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_sport_league_weeks`("id", "season_id", "name", "start_time", "end_time", "espn_events_ref", "type", "created_at", "updated_at") SELECT "id", "season_id", "name", "start_time", "end_time", "espn_events_ref", "type", "created_at", "updated_at" FROM `sport_league_weeks`;--> statement-breakpoint
DROP TABLE `sport_league_weeks`;--> statement-breakpoint
ALTER TABLE `__new_sport_league_weeks` RENAME TO `sport_league_weeks`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `season_id_espn_number_unique` ON `sport_league_weeks` (`season_id`,`name`);
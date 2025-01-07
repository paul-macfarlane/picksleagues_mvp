CREATE TABLE `accounts` (
	`user_id` text(36) NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`provider_account_id` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`provider`, `provider_account_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `authenticators` (
	`credential_id` text NOT NULL,
	`user_id` text(36) NOT NULL,
	`provider_account_id` text NOT NULL,
	`credential_public_key` text NOT NULL,
	`counter` integer NOT NULL,
	`credential_device_type` text NOT NULL,
	`credential_backed_up` integer NOT NULL,
	`transports` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`user_id`, `credential_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `odds_providers` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`name` text(64) NOT NULL,
	`espn_id` text(8),
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `picks_league_invites` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`league_id` text(36) NOT NULL,
	`expires_at` integer NOT NULL,
	`accepted_by_user_id` text(36),
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`league_id`) REFERENCES `picks_leagues`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`accepted_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `picks_league_members` (
	`user_id` text(36) NOT NULL,
	`league_id` text(36) NOT NULL,
	`role` text(32) NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`league_id`) REFERENCES `picks_leagues`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `picks_league_seasons` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`league_id` text(36) NOT NULL,
	`sport_league_season_id` text(36) NOT NULL,
	`start_sport_league_week_id` text(36) NOT NULL,
	`end_sport_league_week_id` text(36) NOT NULL,
	`active` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`league_id`) REFERENCES `picks_leagues`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`sport_league_season_id`) REFERENCES `sport_league_seasons`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`start_sport_league_week_id`) REFERENCES `sport_league_weeks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`end_sport_league_week_id`) REFERENCES `sport_league_weeks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `picks_leagues` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`name` text(32) NOT NULL,
	`logo_url` text(65535),
	`sport_league_id` text(36) NOT NULL,
	`picks_per_week` integer NOT NULL,
	`pick_type` text(32) NOT NULL,
	`visibility` text(32) NOT NULL,
	`size` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`sport_league_id`) REFERENCES `sports_leagues`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`session_token` text PRIMARY KEY NOT NULL,
	`userId` text(36) NOT NULL,
	`expires` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sport_league_game_odds` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`game_id` text(36) NOT NULL,
	`provider_id` text(36) NOT NULL,
	`favorite_team_id` text(36) NOT NULL,
	`under_dog_team_id` text(36) NOT NULL,
	`spread` real NOT NULL,
	`over_under` real NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `sport_league_games`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`provider_id`) REFERENCES `odds_providers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`favorite_team_id`) REFERENCES `sport_league_teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`under_dog_team_id`) REFERENCES `sport_league_teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sport_league_games` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`week_id` text(36) NOT NULL,
	`start_time` integer NOT NULL,
	`status` text(32) NOT NULL,
	`clock` text(16) NOT NULL,
	`period` integer NOT NULL,
	`away_team_id` text(36) NOT NULL,
	`away_team_score` integer NOT NULL,
	`home_team_id` text(36) NOT NULL,
	`home_team_score` integer NOT NULL,
	`espn_id` text(16),
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`week_id`) REFERENCES `sport_league_weeks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`away_team_id`) REFERENCES `sport_league_teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`home_team_id`) REFERENCES `sport_league_teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sport_league_seasons` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`league_id` text(36) NOT NULL,
	`name` text(32) NOT NULL,
	`start_time` integer NOT NULL,
	`end_time` integer NOT NULL,
	`active` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`league_id`) REFERENCES `sports_leagues`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sport_league_teams` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`league_id` text(36) NOT NULL,
	`name` text(256) NOT NULL,
	`location` text(256) NOT NULL,
	`abbreviation` text(8) NOT NULL,
	`logo_url` text(65535),
	`espn_id` text(8),
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`league_id`) REFERENCES `sports_leagues`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sport_league_weeks` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`season_id` text(36) NOT NULL,
	`name` text(32) NOT NULL,
	`start_time` integer NOT NULL,
	`end_time` integer NOT NULL,
	`espn_events_ref` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`season_id`) REFERENCES `sport_league_seasons`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sports_leagues` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`name` text(32) NOT NULL,
	`abbreviation` text(8) NOT NULL,
	`logo_url` text(65535),
	`espn_id` text(8),
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`name` text,
	`first_name` text(64),
	`last_name` text(64),
	`email` text,
	`email_verified` integer,
	`image` text(65535),
	`username` text(20),
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `verification_tokens` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`identifier`, `token`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `authenticators_credential_id_unique` ON `authenticators` (`credential_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `odds_providers_espn_id_unique` ON `odds_providers` (`espn_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `game_id_provider_id_unique` ON `sport_league_game_odds` (`game_id`,`provider_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `sport_league_games_espn_id_unique` ON `sport_league_games` (`espn_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `league_id_name_unique` ON `sport_league_seasons` (`league_id`,`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `league_id_espn_id_unique` ON `sport_league_teams` (`league_id`,`espn_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `season_id_espn_number_unique` ON `sport_league_weeks` (`season_id`,`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `sports_leagues_name_unique` ON `sports_leagues` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `sports_leagues_abbreviation_unique` ON `sports_leagues` (`abbreviation`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);
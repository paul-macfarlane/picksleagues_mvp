PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_picks_league_invites` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`league_id` text(36) NOT NULL,
	`role` text(32) NOT NULL,
	`user_id` text(36),
	`expires_at` integer NOT NULL,
	`accepted_by_user_id` text(36),
	`declined` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`league_id`) REFERENCES `picks_leagues`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`accepted_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_picks_league_invites`("id", "league_id", "role", "user_id", "expires_at", "accepted_by_user_id", "declined", "created_at", "updated_at") SELECT "id", "league_id", "role", "user_id", "expires_at", "accepted_by_user_id", "declined", "created_at", "updated_at" FROM `picks_league_invites`;--> statement-breakpoint
DROP TABLE `picks_league_invites`;--> statement-breakpoint
ALTER TABLE `__new_picks_league_invites` RENAME TO `picks_league_invites`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
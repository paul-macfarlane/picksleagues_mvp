import { UUID_LENGTH, IMG_URL_MAX_LENGTH } from "@/models/db";
import {
  LEAGUE_ROLE_MAX_LENGTH,
  LEAGUE_VISIBILITY_MAX_LENGTH,
  MAX_LEAGUE_NAME_LENGTH,
  PICK_TYPE_MAX_LENGTH,
} from "@/models/leagues";
import {
  SPORT_LEAGUE_NAME_MAX_LENGTH,
  SPORT_SEASON_MAX_LENGTH,
  SPORT_WEEK_MAX_LENGTH,
} from "@/models/sportLeagues";
import {
  MAX_FIRST_NAME_LENGTH,
  MAX_LAST_NAME_LENGTH,
  MAX_USERNAME_LENGTH,
} from "@/models/users";
import { sql } from "drizzle-orm/sql";
import {
  integer,
  sqliteTable,
  text,
  primaryKey,
  unique,
  real,
} from "drizzle-orm/sqlite-core";
import type { AdapterAccountType } from "next-auth/adapters";

/**
 * table used by auth.js to store users, some custom fields added on top
 */
export const users = sqliteTable("users", {
  id: text("id", { length: UUID_LENGTH })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  /**
   * needs to be here for auth.js compatability, but will be unused by the application
   */
  name: text("name"),
  firstName: text("first_name", { length: MAX_FIRST_NAME_LENGTH }),
  lastName: text("last_name", { length: MAX_LAST_NAME_LENGTH }),
  email: text("email").unique(),
  emailVerified: integer("email_verified", { mode: "timestamp_ms" }),
  image: text("image", { length: IMG_URL_MAX_LENGTH }),
  username: text("username", { length: MAX_USERNAME_LENGTH }).unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

/**
 * table used by auth.js to store accounts, some custom fields added on top
 */
export const accounts = sqliteTable(
  "accounts",
  {
    userId: text("user_id", { length: UUID_LENGTH })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

/**
 * table used by auth.js to store sessions, some custom fields added on top
 */
export const sessions = sqliteTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("userId", { length: UUID_LENGTH })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

/**
 * table used by auth.js to store verificationTokens, some custom fields added on top
 * unused at the moment
 */
export const verificationTokens = sqliteTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  }),
);

/**
 * table used by auth.js to store authenticators, some custom fields added on top
 */
export const authenticators = sqliteTable(
  "authenticators",
  {
    credentialID: text("credential_id").notNull().unique(),
    userId: text("user_id", { length: UUID_LENGTH })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("provider_account_id").notNull(),
    credentialPublicKey: text("credential_public_key").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credential_device_type").notNull(),
    credentialBackedUp: integer("credential_backed_up", {
      mode: "boolean",
    }).notNull(),
    transports: text("transports"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  }),
);

export const sportLeagues = sqliteTable("sports_leagues", {
  id: text("id", { length: UUID_LENGTH })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name", { length: SPORT_LEAGUE_NAME_MAX_LENGTH })
    .notNull()
    .unique(),
  abbreviation: text("abbreviation", { length: 8 }).notNull().unique(),
  logoUrl: text("logo_url", { length: IMG_URL_MAX_LENGTH }),
  espnId: text("espn_id", { length: 8 }),
  espnSlug: text("espn_slug", { length: 32 }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export const sportSeasons = sqliteTable(
  "sport_seasons",
  {
    id: text("id", { length: UUID_LENGTH })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    sportLeagueId: text("sport_league_id", { length: UUID_LENGTH })
      .notNull()
      .references(() => sportLeagues.id, { onDelete: "cascade" }),
    name: text("name", { length: SPORT_SEASON_MAX_LENGTH }).notNull(),
    startTime: integer("start_time", { mode: "timestamp" }).notNull(),
    endTime: integer("end_time", { mode: "timestamp" }).notNull(),
    active: integer("active", { mode: "boolean" }).notNull(),
    espnDisplayName: text("espn_display_name", { length: 32 }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    sportLeagueIdESPNDisplayNameUnique: unique(
      "sport_league_id_espn_display_name_unique",
    ).on(t.sportLeagueId, t.espnDisplayName),
  }),
);

export const sportWeeks = sqliteTable(
  "sport_weeks",
  {
    id: text("id", { length: UUID_LENGTH })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    seasonId: text("season_id", { length: UUID_LENGTH })
      .notNull()
      .references(() => sportSeasons.id, { onDelete: "cascade" }),
    name: text("name", { length: SPORT_WEEK_MAX_LENGTH }).notNull(),
    startTime: integer("start_time", { mode: "timestamp" }).notNull(),
    endTime: integer("end_time", { mode: "timestamp" }).notNull(),
    espnNumber: integer("espn_number"),
    espnEventsRef: text("espn_events_ref"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    seasonIdNameUnique: unique("season_id_espn_number_unique").on(
      t.seasonId,
      t.name,
    ),
  }),
);

export const sportGames = sqliteTable("sport_games", {
  id: text("id", { length: UUID_LENGTH })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  weekId: text("week_id", { length: UUID_LENGTH })
    .notNull()
    .references(() => sportWeeks.id, { onDelete: "cascade" }),
  startTime: integer("start_time", { mode: "timestamp" }).notNull(),
  status: text("status", { length: 32 }).notNull(),
  clock: text("clock", { length: 16 }).notNull(),
  period: integer("period").notNull(),
  awayTeamId: text("away_team_id", { length: UUID_LENGTH })
    .notNull()
    .references(() => sportTeams.id, { onDelete: "cascade" }),
  awayTeamScore: integer("away_team_score").notNull(),
  homeTeamId: text("home_team_id", { length: UUID_LENGTH })
    .notNull()
    .references(() => sportTeams.id, { onDelete: "cascade" }),
  homeTeamScore: integer("home_team_score").notNull(),
  espnEventId: text("espn_event_id", { length: 16 }).unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export const sportGameOdds = sqliteTable(
  "sport_game_odds",
  {
    id: text("id", { length: UUID_LENGTH })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    gameId: text("game_id", { length: UUID_LENGTH })
      .notNull()
      .references(() => sportGames.id, { onDelete: "cascade" }),
    providerId: text("provider_id", { length: UUID_LENGTH })
      .notNull()
      .references(() => oddsProviders.id, { onDelete: "cascade" }),
    favoriteTeamId: text("favorite_team_id", { length: UUID_LENGTH })
      .notNull()
      .references(() => sportTeams.id, { onDelete: "cascade" }),
    underDogTeamId: text("under_dog_team_id", { length: UUID_LENGTH })
      .notNull()
      .references(() => sportTeams.id, { onDelete: "cascade" }),
    spread: real("spread").notNull(),
    overUnder: real("over_under").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    gameIdProviderIdUnique: unique("game_id_provider_id_unique").on(
      t.gameId,
      t.providerId,
    ),
  }),
);

export const oddsProviders = sqliteTable("odds_providers", {
  id: text("id", { length: UUID_LENGTH })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name", { length: 64 }).notNull(),
  espnId: text("espn_id", { length: 8 }).unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export const sportTeams = sqliteTable(
  "sport_teams",
  {
    id: text("id", { length: UUID_LENGTH })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    sportLeagueId: text("sport_league_id", { length: UUID_LENGTH })
      .notNull()
      .references(() => sportLeagues.id, { onDelete: "cascade" }),
    name: text("name", { length: 256 }).notNull(),
    location: text("location", { length: 256 }).notNull(),
    abbreviation: text("abbreviation", { length: 8 }).notNull(),
    logoUrl: text("logo_url", { length: IMG_URL_MAX_LENGTH }),
    espnId: text("espn_id", { length: 8 }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    sportLeagueIdEspnIdUnique: unique("sport_league_id_espn_id_unique").on(
      t.sportLeagueId,
      t.espnId,
    ),
  }),
);

export const leagues = sqliteTable("leagues", {
  id: text("id", { length: UUID_LENGTH })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name", { length: MAX_LEAGUE_NAME_LENGTH }).notNull(),
  logoUrl: text("logo_url", { length: IMG_URL_MAX_LENGTH }),
  sportLeagueId: text("sport_league_id", { length: UUID_LENGTH })
    .notNull()
    .references(() => sportLeagues.id, { onDelete: "cascade" }),
  picksPerWeek: integer("picks_per_week").notNull(),
  pickType: text("pick_type", { length: PICK_TYPE_MAX_LENGTH }).notNull(),
  leagueVisibility: text("league_visibility", {
    length: LEAGUE_VISIBILITY_MAX_LENGTH,
  }).notNull(),
  size: integer("size").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export const leagueSeasons = sqliteTable("league_seasons", {
  id: text("id", { length: UUID_LENGTH })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  leagueId: text("league_id", { length: UUID_LENGTH })
    .notNull()
    .references(() => leagues.id, { onDelete: "cascade" }),
  sportSeasonId: text("sport_season_id", { length: UUID_LENGTH })
    .notNull()
    .references(() => sportSeasons.id, { onDelete: "cascade" }),
  startSportWeekId: text("start_sport_week_id", { length: UUID_LENGTH })
    .notNull()
    .references(() => sportWeeks.id, { onDelete: "cascade" }),
  endSportWeekId: text("end_sport_week_id", { length: UUID_LENGTH })
    .notNull()
    .references(() => sportWeeks.id, { onDelete: "cascade" }),
  active: integer("active", { mode: "boolean" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export const leagueMembers = sqliteTable("league_members", {
  userId: text("user_id", { length: UUID_LENGTH })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  leagueId: text("league_id", { length: UUID_LENGTH })
    .notNull()
    .references(() => leagues.id, { onDelete: "cascade" }),
  role: text("role", { length: LEAGUE_ROLE_MAX_LENGTH }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export const leagueInvites = sqliteTable("league_invites", {
  id: text("id", { length: UUID_LENGTH })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  leagueId: text("league_id", { length: UUID_LENGTH })
    .notNull()
    .references(() => leagues.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  acceptedByUserId: text("accepted_by_user_id", {
    length: UUID_LENGTH,
  }).references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

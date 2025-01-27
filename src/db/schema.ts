import { UUID_LENGTH, IMG_URL_MAX_LENGTH } from "@/models/db";
import {
  PICKS_LEAGUE_VISIBILITY_MAX_LENGTH,
  PICKS_LEAGUE_MAX_NAME_LENGTH,
  PICKS_LEAGUE_PICK_TYPE_MAX_LENGTH,
  PicksLeaguePickTypes,
  PicksLeagueVisibilities,
} from "@/models/picksLeagues";
import {
  SPORT_LEAGUE_NAME_MAX_LENGTH,
  SPORT_LEAGUE_SEASON_MAX_LENGTH,
  SPORT_LEAGUE_WEEK_MAX_LENGTH,
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
import {
  PICKS_LEAGUE_ROLE_MAX_LENGTH,
  PicksLeagueMemberRoles,
} from "@/models/picksLeagueMembers";
import { GamePickStatuses } from "@/shared/picksLeaguePicks";
import { SportLeagueWeekTypes } from "@/models/sportLeagueWeeks";
import { SportLeagueGameStatuses } from "@/models/sportLeagueGames";

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
  (t) => [
    primaryKey({
      columns: [t.identifier, t.token],
    }),
  ],
);

/**
 * table used by auth.js to store authenticators, some custom fields added on top
 */
export const authenticators = sqliteTable(
  "authenticators",
  {
    credentialId: text("credential_id").notNull().unique(),
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
  (t) => [
    primaryKey({
      columns: [t.userId, t.credentialId],
    }),
  ],
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
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export const sportLeagueSeasons = sqliteTable(
  "sport_league_seasons",
  {
    id: text("id", { length: UUID_LENGTH })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    leagueId: text("league_id", { length: UUID_LENGTH })
      .notNull()
      .references(() => sportLeagues.id, { onDelete: "cascade" }),
    name: text("name", { length: SPORT_LEAGUE_SEASON_MAX_LENGTH }).notNull(),
    startTime: integer("start_time", { mode: "timestamp" }).notNull(),
    endTime: integer("end_time", { mode: "timestamp" }).notNull(),
    active: integer("active", { mode: "boolean" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
  },
  (t) => [unique("league_id_name_unique").on(t.leagueId, t.name)],
);

export const sportLeagueWeeks = sqliteTable(
  "sport_league_weeks",
  {
    id: text("id", { length: UUID_LENGTH })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    seasonId: text("season_id", { length: UUID_LENGTH })
      .notNull()
      .references(() => sportLeagueSeasons.id, { onDelete: "cascade" }),
    name: text("name", { length: SPORT_LEAGUE_WEEK_MAX_LENGTH }).notNull(),
    startTime: integer("start_time", { mode: "timestamp" }).notNull(),
    endTime: integer("end_time", { mode: "timestamp" }).notNull(),
    espnEventsRef: text("espn_events_ref"),
    type: text("type", {
      enum: [
        SportLeagueWeekTypes.PLAYOFFS,
        SportLeagueWeekTypes.REGULAR_SEASON,
      ],
    }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
  },
  (t) => [unique("season_id_espn_number_unique").on(t.seasonId, t.name)],
);

export const sportLeagueGames = sqliteTable("sport_league_games", {
  id: text("id", { length: UUID_LENGTH })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  weekId: text("week_id", { length: UUID_LENGTH })
    .notNull()
    .references(() => sportLeagueWeeks.id, { onDelete: "cascade" }),
  startTime: integer("start_time", { mode: "timestamp" }).notNull(),
  status: text("status", {
    length: 32,
    enum: [
      SportLeagueGameStatuses.FINAL,
      SportLeagueGameStatuses.IN_PROGRESS,
      SportLeagueGameStatuses.SCHEDULED,
    ],
  }).notNull(),
  clock: text("clock", { length: 16 }).notNull(),
  period: integer("period").notNull(),
  awayTeamId: text("away_team_id", { length: UUID_LENGTH })
    .notNull()
    .references(() => sportLeagueTeams.id, { onDelete: "cascade" }),
  awayTeamScore: integer("away_team_score").notNull(),
  homeTeamId: text("home_team_id", { length: UUID_LENGTH })
    .notNull()
    .references(() => sportLeagueTeams.id, { onDelete: "cascade" }),
  homeTeamScore: integer("home_team_score").notNull(),
  espnId: text("espn_id", { length: 16 }).unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export const sportLeagueGameOdds = sqliteTable(
  "sport_league_game_odds",
  {
    id: text("id", { length: UUID_LENGTH })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    gameId: text("game_id", { length: UUID_LENGTH })
      .notNull()
      .references(() => sportLeagueGames.id, { onDelete: "cascade" }),
    providerId: text("provider_id", { length: UUID_LENGTH })
      .notNull()
      .references(() => oddsProviders.id, { onDelete: "cascade" }),
    favoriteTeamId: text("favorite_team_id", { length: UUID_LENGTH })
      .notNull()
      .references(() => sportLeagueTeams.id, { onDelete: "cascade" }),
    underDogTeamId: text("under_dog_team_id", { length: UUID_LENGTH })
      .notNull()
      .references(() => sportLeagueTeams.id, { onDelete: "cascade" }),
    spread: real("spread").notNull(),
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

export const sportLeagueTeams = sqliteTable(
  "sport_league_teams",
  {
    id: text("id", { length: UUID_LENGTH })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    leagueId: text("league_id", { length: UUID_LENGTH })
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
  (t) => [unique("league_id_espn_id_unique").on(t.leagueId, t.espnId)],
);

export const picksLeagues = sqliteTable("picks_leagues", {
  id: text("id", { length: UUID_LENGTH })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name", { length: PICKS_LEAGUE_MAX_NAME_LENGTH }).notNull(),
  logoUrl: text("logo_url", { length: IMG_URL_MAX_LENGTH }),
  sportLeagueId: text("sport_league_id", { length: UUID_LENGTH })
    .notNull()
    .references(() => sportLeagues.id, { onDelete: "cascade" }),
  picksPerWeek: integer("picks_per_week").notNull(),
  pickType: text("pick_type", {
    length: PICKS_LEAGUE_PICK_TYPE_MAX_LENGTH,
    enum: [
      PicksLeaguePickTypes.STRAIGHT_UP,
      PicksLeaguePickTypes.AGAINST_THE_SPREAD,
    ],
  }).notNull(),
  visibility: text("visibility", {
    length: PICKS_LEAGUE_VISIBILITY_MAX_LENGTH,
    enum: [PicksLeagueVisibilities.PRIVATE, PicksLeagueVisibilities.PUBLIC],
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

export const picksLeagueSeasons = sqliteTable("picks_league_seasons", {
  id: text("id", { length: UUID_LENGTH })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  leagueId: text("league_id", { length: UUID_LENGTH })
    .notNull()
    .references(() => picksLeagues.id, { onDelete: "cascade" }),
  sportLeagueSeasonId: text("sport_league_season_id", { length: UUID_LENGTH })
    .notNull()
    .references(() => sportLeagueSeasons.id, { onDelete: "cascade" }),
  startSportLeagueWeekId: text("start_sport_league_week_id", {
    length: UUID_LENGTH,
  })
    .notNull()
    .references(() => sportLeagueWeeks.id, { onDelete: "cascade" }),
  endSportLeagueWeekId: text("end_sport_league_week_id", {
    length: UUID_LENGTH,
  })
    .notNull()
    .references(() => sportLeagueWeeks.id, { onDelete: "cascade" }),
  active: integer("active", { mode: "boolean" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export const picksLeagueMembers = sqliteTable("picks_league_members", {
  userId: text("user_id", { length: UUID_LENGTH })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  leagueId: text("league_id", { length: UUID_LENGTH })
    .notNull()
    .references(() => picksLeagues.id, { onDelete: "cascade" }),
  role: text("role", {
    length: PICKS_LEAGUE_ROLE_MAX_LENGTH,
    enum: [
      PicksLeagueMemberRoles.MEMBER,
      PicksLeagueMemberRoles.COMMISSIONER,
      PicksLeagueMemberRoles.NONE,
    ],
  }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export const picksLeagueInvites = sqliteTable("picks_league_invites", {
  id: text("id", { length: UUID_LENGTH })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  leagueId: text("league_id", { length: UUID_LENGTH })
    .notNull()
    .references(() => picksLeagues.id, { onDelete: "cascade" }),
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

export const picksLeaguePicks = sqliteTable("picks_league_picks", {
  id: text("id", { length: UUID_LENGTH })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id", { length: UUID_LENGTH })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  leagueId: text("league_id", { length: UUID_LENGTH })
    .notNull()
    .references(() => picksLeagues.id, { onDelete: "cascade" }),
  sportLeagueWeekId: text("sport_league_week_id", { length: UUID_LENGTH })
    .notNull()
    .references(() => sportLeagueWeeks.id, { onDelete: "cascade" }),
  sportLeagueGameId: text("sport_league_game_id", { length: UUID_LENGTH })
    .notNull()
    .references(() => sportLeagueGames.id, { onDelete: "cascade" }),
  type: text("type", {
    length: 32,
    enum: [
      PicksLeaguePickTypes.AGAINST_THE_SPREAD,
      PicksLeaguePickTypes.STRAIGHT_UP,
    ],
  }).notNull(),
  teamId: text("team_id", { length: UUID_LENGTH })
    .notNull()
    .references(() => sportLeagueTeams.id, { onDelete: "cascade" }),
  spread: real("spread"),
  favorite: integer("favorite", {
    mode: "boolean",
  }),
  status: text("status", {
    length: 32,
    enum: [
      GamePickStatuses.WIN,
      GamePickStatuses.PICKED,
      GamePickStatuses.LOSS,
      GamePickStatuses.PUSH,
      GamePickStatuses.UNPICKED,
    ],
  })
    .notNull()
    .default(GamePickStatuses.PICKED),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export const picksLeagueStandings = sqliteTable("picks_league_standings", {
  id: text("id", { length: UUID_LENGTH })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id", { length: UUID_LENGTH })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  seasonId: text("season_id")
    .notNull()
    .references(() => picksLeagueSeasons.id, { onDelete: "cascade" }),
  wins: integer().notNull().default(0),
  losses: integer().notNull().default(0),
  pushes: integer().notNull().default(0),
  points: real().notNull().default(0.0),
  rank: integer().notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

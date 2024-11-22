import { UUID_LENGTH, IMG_URL_MAX_LENGTH } from "@/models/db";
import {
  LEAGUE_ROLE_MAX_LENGTH,
  MAX_LEAGUE_NAME_LENGTH,
} from "@/models/leagues";
import {
  LEAGUE_VISIBILITY_MAX_LENGTH,
  PICK_TYPE_MAX_LENGTH,
  SPORT_NAME_MAX_LENGTH,
  SPORT_SEASON_MAX_LENGTH,
  SPORT_WEEK_MAX_LENGTH,
} from "@/models/sports";
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

export const sports = sqliteTable("sports", {
  id: text("id", { length: UUID_LENGTH })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name", { length: SPORT_NAME_MAX_LENGTH }).notNull(),
  order: integer("order").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export const sportSeasons = sqliteTable("sport_seasons", {
  id: text("id", { length: UUID_LENGTH })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  sportId: text("sport_id", { length: UUID_LENGTH })
    .notNull()
    .references(() => sports.id, { onDelete: "cascade" }),
  name: text("name", { length: SPORT_SEASON_MAX_LENGTH }).notNull(),
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
});

export const sportWeeks = sqliteTable("sport_weeks", {
  id: text("id", { length: UUID_LENGTH })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  seasonId: text("season_id", { length: UUID_LENGTH })
    .notNull()
    .references(() => sportSeasons.id, { onDelete: "cascade" }),
  name: text("name", { length: SPORT_WEEK_MAX_LENGTH }).notNull(),
  startTime: integer("start_time", { mode: "timestamp" }).notNull(),
  endTime: integer("end_time", { mode: "timestamp" }).notNull(),
  defaultStart: integer("default_start", { mode: "boolean" })
    .default(false)
    .notNull(),
  defaultEnd: integer("default_end", { mode: "boolean" })
    .default(false)
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export const leagues = sqliteTable("leagues", {
  id: text("id", { length: UUID_LENGTH })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name", { length: MAX_LEAGUE_NAME_LENGTH }).notNull(),
  logoUrl: text("logo_url", { length: IMG_URL_MAX_LENGTH }),
  sportId: text("sport_id", { length: UUID_LENGTH })
    .notNull()
    .references(() => sports.id, { onDelete: "cascade" }),
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

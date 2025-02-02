import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "./client";
import { sportLeagues, sportLeagueSeasons, sportLeagueWeeks } from "./schema";
import { DBSportLeagueWeek } from "@/db/sportLeagueWeeks";
import {
  DBSportLeagueSeason,
  DBSportLeagueSeasonDetail,
} from "@/db/sportLeagueSeason";
import { DBTransaction } from "@/db/transactions";
import { ESPNLeagueSlug, ESPNSportSlug } from "@/integrations/espn/shared";

export interface DBSportLeague {
  id: string;
  name: string;
  abbreviation: string;
  logoUrl: string | null;
  espnId: string;
  espnSlug: ESPNLeagueSlug;
  espnSportSlug: ESPNSportSlug;
  createdAt: Date;
  updatedAt: Date;
}

export interface DBSportLeagueWithActiveSeasonDetail extends DBSportLeague {
  season: DBSportLeagueSeasonDetail;
}

export async function getAllDBSportLeaguesWithActiveSeason(): Promise<
  DBSportLeagueWithActiveSeasonDetail[]
> {
  const now = new Date();
  const queryRows = await db
    .select()
    .from(sportLeagues)
    .innerJoin(
      sportLeagueSeasons,
      and(
        eq(sportLeagues.id, sportLeagueSeasons.leagueId),
        lte(sportLeagueSeasons.startTime, now),
        gte(sportLeagueSeasons.endTime, now),
      ),
    )
    .leftJoin(
      sportLeagueWeeks,
      and(
        eq(sportLeagueSeasons.id, sportLeagueWeeks.seasonId),
        gte(sportLeagueWeeks.startTime, new Date()),
      ),
    )
    .orderBy(sportLeagueWeeks.startTime);
  if (!queryRows.length) {
    return [];
  }

  const dbSportLeagueWithActiveSeasonDetails: DBSportLeagueWithActiveSeasonDetail[] =
    [];
  queryRows.forEach((row) => {
    const existingSportDetailIndex =
      dbSportLeagueWithActiveSeasonDetails.findIndex(
        (detail) => detail.id === row.sports_leagues.id,
      );
    if (existingSportDetailIndex === -1) {
      dbSportLeagueWithActiveSeasonDetails.push({
        ...row.sports_leagues,
        season: {
          ...row.sport_league_seasons,
          weeks: row.sport_league_weeks ? [row.sport_league_weeks] : [],
        },
      });

      return;
    }

    if (row.sport_league_weeks) {
      dbSportLeagueWithActiveSeasonDetails[
        existingSportDetailIndex
      ].season.weeks.push(row.sport_league_weeks);
    }
  });

  return dbSportLeagueWithActiveSeasonDetails;
}

export async function getDBSportLeagueById(
  id: string,
): Promise<DBSportLeague | null> {
  const queryRows = await db
    .select()
    .from(sportLeagues)
    .where(eq(sportLeagues.id, id));
  if (!queryRows.length) {
    return null;
  }

  return queryRows[0];
}

export async function getActiveSeasonForDBSportLeague(
  sportLeagueId: string,
): Promise<DBSportLeagueSeason | null> {
  const now = new Date();
  const queryRows = await db
    .select()
    .from(sportLeagueSeasons)
    .where(
      and(
        eq(sportLeagueSeasons.leagueId, sportLeagueId),
        lte(sportLeagueSeasons.startTime, now),
        gte(sportLeagueSeasons.endTime, now),
      ),
    );
  if (!queryRows.length) {
    return null;
  }

  return queryRows[0];
}

export async function getDBSportLeagueWeekById(
  id: string,
  tx?: DBTransaction,
): Promise<DBSportLeagueWeek | null> {
  const queryRows = tx
    ? await tx
        .select()
        .from(sportLeagueWeeks)
        .where(eq(sportLeagueWeeks.id, id))
    : await db
        .select()
        .from(sportLeagueWeeks)
        .where(eq(sportLeagueWeeks.id, id));
  if (!queryRows.length) {
    return null;
  }

  return queryRows[0];
}

export interface UpsertDBSportLeague {
  name: string;
  abbreviation: string;
  logoUrl: string | null;
  espnId: string;
  espnSlug: ESPNLeagueSlug;
  espnSportSlug: ESPNSportSlug;
}

export async function upsertDBSportLeagues(
  upserts: UpsertDBSportLeague[],
  tx?: DBTransaction,
): Promise<DBSportLeague[]> {
  if (tx) {
    return tx
      .insert(sportLeagues)
      .values(upserts)
      .onConflictDoUpdate({
        target: [sportLeagues.name],
        set: {
          name: sql`excluded.name`,
          abbreviation: sql`excluded.abbreviation`,
          logoUrl: sql`excluded.logo_url`,
          espnId: sql`excluded.espn_id`,
          espnSlug: sql`excluded.espn_slug`,
          espnSportSlug: sql`excluded.espn_sport_slug`,
        },
      })
      .returning();
  } else {
    return db
      .insert(sportLeagues)
      .values(upserts)
      .onConflictDoUpdate({
        target: [sportLeagues.name],
        set: {
          name: sql`excluded.name`,
          abbreviation: sql`excluded.abbreviation`,
          logoUrl: sql`excluded.logo_url`,
          espnId: sql`excluded.espn_id`,
          espnSlug: sql`excluded.espn_slug`,
          espnSportSlug: sql`excluded.espn_sport_slug`,
        },
      })
      .returning();
  }
}

export async function getAllDBSportLeagues(
  tx?: DBTransaction,
): Promise<DBSportLeague[]> {
  return tx ? tx.select().from(sportLeagues) : db.select().from(sportLeagues);
}

import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "./client";
import { sportLeagues, sportLeagueSeasons, sportLeagueWeeks } from "./schema";
import { DBSportLeagueWeek } from "@/db/sportLeagueWeeks";
import {
  DBSportLeagueSeason,
  DBSportLeagueSeasonDetail,
} from "@/db/sportLeagueSeason";
import { DBTransaction } from "@/db/transactions";

export interface DBSportLeague {
  id: string;
  name: string;
  abbreviation: string;
  logoUrl: string | null;
  espnId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DBSportLeagueWithActiveSeasonDetail extends DBSportLeague {
  season: DBSportLeagueSeasonDetail;
}

export async function getAllDBSportLeaguesWithActiveSeason(): Promise<
  DBSportLeagueWithActiveSeasonDetail[]
> {
  const queryRows = await db
    .select()
    .from(sportLeagues)
    .innerJoin(
      sportLeagueSeasons,
      and(
        eq(sportLeagues.id, sportLeagueSeasons.leagueId),
        eq(sportLeagueSeasons.active, true),
      ),
    )
    .innerJoin(
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
          weeks: [row.sport_league_weeks],
        },
      });

      return;
    }

    dbSportLeagueWithActiveSeasonDetails[
      existingSportDetailIndex
    ].season.weeks.push(row.sport_league_weeks);
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
  const queryRows = await db
    .select()
    .from(sportLeagueSeasons)
    .where(
      and(
        eq(sportLeagueSeasons.leagueId, sportLeagueId),
        eq(sportLeagueSeasons.active, true),
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
  logoUrl?: string;
  espnId?: string;
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
        },
      })
      .returning();
  }
}

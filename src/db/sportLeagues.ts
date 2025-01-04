import { and, eq, gte } from "drizzle-orm";
import { db } from "./client";
import { sportLeagues, sportSeasons, sportWeeks } from "./schema";

export interface DBSportLeague {
  id: string;
  name: string;
  abbreviation: string;
  logoUrl: string | null;
  espnId: string | null;
  espnSlug: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DBSportSeason {
  id: string;
  sportLeagueId: string;
  name: string;
  startTime: Date;
  endTime: Date;
  active: boolean;
  espnDisplayName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DBSportSeasonDetail extends DBSportSeason {
  weeks: DBSportWeek[];
}

export interface DBSportWeek {
  id: string;
  seasonId: string;
  name: string;
  startTime: Date;
  endTime: Date;
  espnNumber: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DBSportLeagueWithActiveSeasonDetail extends DBSportLeague {
  season: DBSportSeasonDetail;
}

export async function getAllDBSportLeaguesWithActiveSeason(): Promise<
  DBSportLeagueWithActiveSeasonDetail[]
> {
  const queryRows = await db
    .select()
    .from(sportLeagues)
    .innerJoin(
      sportSeasons,
      and(
        eq(sportLeagues.id, sportSeasons.sportLeagueId),
        eq(sportSeasons.active, true),
      ),
    )
    .innerJoin(
      sportWeeks,
      and(
        eq(sportSeasons.id, sportWeeks.seasonId),
        gte(sportWeeks.startTime, new Date()),
      ),
    )
    .orderBy(sportWeeks.startTime);
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
          ...row.sport_seasons,
          weeks: [row.sport_weeks],
        },
      });

      return;
    }

    dbSportLeagueWithActiveSeasonDetails[
      existingSportDetailIndex
    ].season.weeks.push(row.sport_weeks);
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
): Promise<DBSportSeason | null> {
  const queryRows = await db
    .select()
    .from(sportSeasons)
    .where(
      and(
        eq(sportSeasons.sportLeagueId, sportLeagueId),
        eq(sportSeasons.active, true),
      ),
    );
  if (!queryRows.length) {
    return null;
  }

  return queryRows[0];
}

export async function getDBSportWeekById(
  id: string,
): Promise<DBSportWeek | null> {
  const queryRows = await db
    .select()
    .from(sportWeeks)
    .where(eq(sportWeeks.id, id));
  if (!queryRows.length) {
    return null;
  }

  return queryRows[0];
}

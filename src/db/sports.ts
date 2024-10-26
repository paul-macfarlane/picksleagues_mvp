import { and, eq, gte } from "drizzle-orm";
import { db } from "./client";
import { sports, sportSeasons, sportWeeks } from "./schema";

interface DBSport {
  id: string;
  name: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

interface DBSportSeason {
  id: string;
  name: string;
  sportId: string;
  startTime: Date;
  endTime: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface DBSportSeasonDetail extends DBSportSeason {
  weeks: DBSportWeek[];
}

export interface DBSportWeek {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date;
  seasonId: string;
  defaultStart: boolean;
  defaultEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DBSportWithActiveSeasonDetail extends DBSport {
  season: DBSportSeasonDetail;
}

export async function getAllDBSportsWithActiveSeason(): Promise<
  DBSportWithActiveSeasonDetail[]
> {
  const queryRows = await db
    .select()
    .from(sports)
    .innerJoin(
      sportSeasons,
      and(eq(sports.id, sportSeasons.sportId), eq(sportSeasons.active, true)),
    )
    .innerJoin(
      sportWeeks,
      and(
        eq(sportSeasons.id, sportWeeks.seasonId),
        gte(sportWeeks.endTime, new Date()),
      ),
    );
  if (!queryRows.length) {
    return [];
  }

  const sportDetails: DBSportWithActiveSeasonDetail[] = [];

  queryRows.forEach((row) => {
    const existingSportDetailIndex = sportDetails.findIndex(
      (detail) => detail.id === row.sports.id,
    );
    if (existingSportDetailIndex === -1) {
      sportDetails.push({
        ...row.sports,
        season: {
          ...row.sport_seasons,
          weeks: [row.sport_weeks],
        },
      });

      return;
    }

    sportDetails[existingSportDetailIndex].season.weeks.push(row.sport_weeks);
  });

  return sportDetails;
}

export async function getDBSportById(id: string): Promise<DBSport | null> {
  const queryRows = await db.select().from(sports).where(eq(sports.id, id));
  if (!queryRows.length) {
    return null;
  }

  return queryRows[0];
}

export async function getActiveSeasonForSport(
  sportId: string,
): Promise<DBSportSeason | null> {
  const queryRows = await db
    .select()
    .from(sportSeasons)
    .where(
      and(eq(sportSeasons.sportId, sportId), eq(sportSeasons.active, true)),
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

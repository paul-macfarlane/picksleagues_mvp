import { DBTransaction } from "@/db/transactions";
import {
  picksLeaguePicks,
  sportLeagueSeasons,
  sportLeagueWeeks,
} from "@/db/schema";
import { db } from "@/db/client";
import { and, eq, getTableColumns, gt, lte } from "drizzle-orm";

export interface DBPicksLeaguePick {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  leagueId: string;
  spread: number | null;
  userId: string;
  type: string;
  sportLeagueWeekId: string;
  sportLeagueGameId: string;
  teamId: string;
  favorite: boolean | null;
}

export interface CreateDBPicksLeaguePick {
  leagueId: string;
  spread: number | null;
  userId: string;
  type: string;
  sportLeagueWeekId: string;
  sportLeagueGameId: string;
  teamId: string;
  favorite: boolean | null;
}

export async function createDBPicksLeaguePicks(
  data: CreateDBPicksLeaguePick[],
  tx?: DBTransaction,
): Promise<DBPicksLeaguePick[]> {
  return tx
    ? await tx.insert(picksLeaguePicks).values(data).returning()
    : db.insert(picksLeaguePicks).values(data).returning();
}

export async function getUserDBPicksLeaguePicksForCurrentWeek(
  userId: string,
  picksLeagueId: string,
  sportLeagueId: string,
): Promise<DBPicksLeaguePick[]> {
  const now = new Date();

  const queryRows = await db
    .select({ picksLeaguePick: getTableColumns(picksLeaguePicks) })
    .from(picksLeaguePicks)
    .innerJoin(
      sportLeagueWeeks,
      eq(sportLeagueWeeks.id, picksLeaguePicks.sportLeagueWeekId),
    )
    .innerJoin(
      sportLeagueSeasons,
      eq(sportLeagueSeasons.id, sportLeagueWeeks.seasonId),
    )
    .where(
      and(
        lte(sportLeagueWeeks.startTime, now),
        gt(sportLeagueWeeks.endTime, now),
        eq(sportLeagueSeasons.leagueId, sportLeagueId),
        eq(picksLeaguePicks.userId, userId),
        eq(picksLeaguePicks.leagueId, picksLeagueId),
      ),
    );

  console.log("queryRows", queryRows);

  return queryRows.map((row) => row.picksLeaguePick);
}

import { Transaction as DBTransaction } from "@/db/transactions";
import { picksLeagueSeasons } from "@/db/schema";
import { db } from "@/db/client";

export interface CreateDBPicksLeagueSeason {
  leagueId: string;
  sportLeagueSeasonId: string;
  startSportLeagueWeekId: string;
  endSportLeagueWeekId: string;
  active: boolean;
}

export interface DBPicksLeagueSeason {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  leagueId: string;
  sportLeagueSeasonId: string;
  startSportLeagueWeekId: string;
  endSportLeagueWeekId: string;
}

export async function createDBPicksLeagueSeason(
  data: CreateDBPicksLeagueSeason,
  tx?: DBTransaction,
): Promise<DBPicksLeagueSeason | null> {
  const queryRows = tx
    ? await tx.insert(picksLeagueSeasons).values(data).returning()
    : await db.insert(picksLeagueSeasons).values(data).returning();
  if (!queryRows.length) {
    return null;
  }

  return queryRows[0];
}

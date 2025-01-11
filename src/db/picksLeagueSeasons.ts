import { DBTransaction } from "@/db/transactions";
import { picksLeagueSeasons } from "@/db/schema";
import { db } from "@/db/client";
import { and, eq } from "drizzle-orm";

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

export interface UpdateDBPicksLeagueSeason {
  active?: boolean;
  leagueId?: string;
  sportLeagueSeasonId?: string;
  startSportLeagueWeekId?: string;
  endSportLeagueWeekId?: string;
}

export async function updateDBPicksLeagueSeason(
  id: string,
  update: UpdateDBPicksLeagueSeason,
  tx?: DBTransaction,
) {
  const queryRows = tx
    ? await tx
        .update(picksLeagueSeasons)
        .set(update)
        .where(eq(picksLeagueSeasons.id, id))
        .returning()
    : await db
        .update(picksLeagueSeasons)
        .set(update)
        .where(eq(picksLeagueSeasons.id, id))
        .returning();
  if (!queryRows.length) {
    return null;
  }

  return queryRows[0];
}

export async function getActiveDBPicksLeagueSeason(
  picksLeagueId: string,
  tx?: DBTransaction,
): Promise<DBPicksLeagueSeason | null> {
  const queryRows = tx
    ? await tx
        .select()
        .from(picksLeagueSeasons)
        .where(
          and(
            eq(picksLeagueSeasons.leagueId, picksLeagueId),
            eq(picksLeagueSeasons.active, true),
          ),
        )
    : await db
        .select()
        .from(picksLeagueSeasons)
        .where(
          and(
            eq(picksLeagueSeasons.leagueId, picksLeagueId),
            eq(picksLeagueSeasons.active, true),
          ),
        );
  if (!queryRows.length) {
    return null;
  }

  return queryRows[0];
}

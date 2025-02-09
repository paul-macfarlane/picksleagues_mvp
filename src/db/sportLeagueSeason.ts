import { DBSportLeagueWeek } from "@/db/sportLeagueWeeks";
import { DBTransaction } from "@/db/transactions";
import { sportLeagueSeasons, sportLeagueWeeks } from "@/db/schema";
import { and, desc, eq, getTableColumns, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db/client";

export interface DBSportLeagueSeason {
  id: string;
  leagueId: string;
  name: string;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DBSportLeagueSeasonDetail extends DBSportLeagueSeason {
  weeks: DBSportLeagueWeek[];
}

export interface UpsertDBSportLeagueSeason {
  leagueId: string;
  name: string;
  startTime: Date;
  endTime: Date;
}

export async function upsertDBSportLeagueSeasons(
  upserts: UpsertDBSportLeagueSeason[],
  tx?: DBTransaction,
): Promise<DBSportLeagueSeason[]> {
  if (tx) {
    return tx
      .insert(sportLeagueSeasons)
      .values(upserts)
      .onConflictDoUpdate({
        target: [sportLeagueSeasons.leagueId, sportLeagueSeasons.name],
        set: {
          startTime: sql`excluded.start_time`,
          endTime: sql`excluded.end_time`,
        },
      })
      .returning();
  } else {
    return db
      .insert(sportLeagueSeasons)
      .values(upserts)
      .onConflictDoUpdate({
        target: [sportLeagueSeasons.leagueId, sportLeagueSeasons.name],
        set: {
          startTime: sql`excluded.start_time`,
          endTime: sql`excluded.end_time`,
        },
      })
      .returning();
  }
}

export async function getActiveDBSportLeagueSeason(
  sportLeagueId: string,
  tx?: DBTransaction,
): Promise<DBSportLeagueSeason | null> {
  const now = new Date();

  const queryRows = tx
    ? await tx
        .select()
        .from(sportLeagueSeasons)
        .where(
          and(
            eq(sportLeagueSeasons.leagueId, sportLeagueId),
            lte(sportLeagueSeasons.startTime, now),
            gte(sportLeagueSeasons.endTime, now),
          ),
        )
    : await db
        .select()
        .from(sportLeagueSeasons)
        .where(
          and(
            eq(sportLeagueSeasons.leagueId, sportLeagueId),
            lte(sportLeagueSeasons.startTime, now),
            gte(sportLeagueSeasons.endTime, now),
          ),
        );

  return queryRows.length > 0 ? queryRows[0] : null;
}

export async function getActiveDBSportLeagueSeasonHavingActiveWeeks(
  sportLeagueId: string,
  tx?: DBTransaction,
): Promise<DBSportLeagueSeason | null> {
  const now = new Date();

  const queryRows = tx
    ? await tx
        .select({
          season: getTableColumns(sportLeagueSeasons),
        })
        .from(sportLeagueSeasons)
        .innerJoin(
          sportLeagueWeeks,
          eq(sportLeagueSeasons.id, sportLeagueWeeks.seasonId),
        )
        .where(
          and(
            eq(sportLeagueSeasons.leagueId, sportLeagueId),
            lte(sportLeagueSeasons.startTime, now),
            gte(sportLeagueSeasons.endTime, now),
            gte(sportLeagueWeeks.startTime, now),
          ),
        )
    : await db
        .select({
          season: getTableColumns(sportLeagueSeasons),
        })
        .from(sportLeagueSeasons)
        .innerJoin(
          sportLeagueWeeks,
          eq(sportLeagueSeasons.id, sportLeagueWeeks.seasonId),
        )
        .where(
          and(
            eq(sportLeagueSeasons.leagueId, sportLeagueId),
            lte(sportLeagueSeasons.startTime, now),
            gte(sportLeagueSeasons.endTime, now),
            gte(sportLeagueWeeks.startTime, now),
          ),
        );

  return queryRows.length > 0 ? queryRows[0].season : null;
}

export async function getNextDBSportLeagueSeason(
  sportLeagueId: string,
  tx?: DBTransaction,
): Promise<DBSportLeagueSeason | null> {
  const now = new Date();

  const queryRows = tx
    ? await tx
        .select()
        .from(sportLeagueSeasons)
        .where(
          and(
            eq(sportLeagueSeasons.leagueId, sportLeagueId),
            gte(sportLeagueSeasons.startTime, now),
          ),
        )
        .orderBy(sportLeagueSeasons.startTime)
    : await db
        .select()
        .from(sportLeagueSeasons)
        .where(
          and(
            eq(sportLeagueSeasons.leagueId, sportLeagueId),
            gte(sportLeagueSeasons.startTime, now),
          ),
        )
        .orderBy(sportLeagueSeasons.startTime);

  return queryRows.length > 0 ? queryRows[0] : null;
}

export async function getDBSportLeagueSeasonById(
  id: string,
): Promise<DBSportLeagueSeason | null> {
  const queryRows = await db
    .select()
    .from(sportLeagueSeasons)
    .where(eq(sportLeagueSeasons.id, id));
  return queryRows.length > 0 ? queryRows[0] : null;
}

export async function getLatestDBSportLeagueSeason(
  sportLeagueId: string,
  tx?: DBTransaction,
): Promise<DBSportLeagueSeason | null> {
  const queryRows = tx
    ? await tx
        .select()
        .from(sportLeagueSeasons)
        .where(eq(sportLeagueSeasons.leagueId, sportLeagueId))
        .orderBy(desc(sportLeagueSeasons.startTime))
    : await db
        .select()
        .from(sportLeagueSeasons)
        .where(eq(sportLeagueSeasons.leagueId, sportLeagueId))
        .orderBy(desc(sportLeagueSeasons.startTime));
  return queryRows.length > 0 ? queryRows[0] : null;
}

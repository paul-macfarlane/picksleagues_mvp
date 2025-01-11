import { sportLeagueWeeks } from "@/db/schema";
import { and, gt, lte, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { DBTransaction } from "@/db/transactions";

export interface DBSportLeagueWeek {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date;
  seasonId: string;
  espnEventsRef: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function getCurrentDBSportLeagueWeeks(
  tx?: DBTransaction,
): Promise<DBSportLeagueWeek[]> {
  const now = new Date();
  let queryRows = [];
  if (tx) {
    queryRows = await tx
      .select()
      .from(sportLeagueWeeks)
      .where(
        and(
          lte(sportLeagueWeeks.startTime, now),
          gt(sportLeagueWeeks.endTime, now),
        ),
      );
    return queryRows;
  } else {
    queryRows = await db
      .select()
      .from(sportLeagueWeeks)
      .where(
        and(
          lte(sportLeagueWeeks.startTime, now),
          gt(sportLeagueWeeks.endTime, now),
        ),
      );
    return queryRows;
  }
}

export interface UpsertDBSportLeagueWeek {
  seasonId: string;
  name: string;
  startTime: Date;
  endTime: Date;
  espnEventsRef?: string;
}

export async function upsertDBSportLeagueWeeks(
  upserts: UpsertDBSportLeagueWeek[],
  tx: DBTransaction,
): Promise<DBSportLeagueWeek[]> {
  if (tx) {
    return tx
      .insert(sportLeagueWeeks)
      .values(upserts)
      .onConflictDoUpdate({
        target: [sportLeagueWeeks.seasonId, sportLeagueWeeks.name],
        set: {
          startTime: sql`excluded.start_time`,
          endTime: sql`excluded.end_time`,
          espnEventsRef: sql`excluded.espn_events_ref`,
        },
      })
      .returning();
  } else {
    return db
      .insert(sportLeagueWeeks)
      .values(upserts)
      .onConflictDoUpdate({
        target: [sportLeagueWeeks.seasonId, sportLeagueWeeks.name],
        set: {
          startTime: sql`excluded.start_time`,
          endTime: sql`excluded.end_time`,
          espnEventsRef: sql`excluded.espn_events_ref`,
        },
      })
      .returning();
  }
}

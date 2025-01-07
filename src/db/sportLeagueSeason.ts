import { DBSportLeagueWeek } from "@/db/sportLeagueWeeks";
import { Transaction } from "@/db/transactions";
import { sportLeagueSeasons } from "@/db/schema";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";

export interface DBSportLeagueSeason {
  id: string;
  leagueId: string;
  name: string;
  startTime: Date;
  endTime: Date;
  active: boolean;
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
  active: boolean;
}

export async function upsertDBSportLeagueSeasons(
  upserts: UpsertDBSportLeagueSeason[],
  tx?: Transaction,
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
          active: sql`excluded.active`,
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
          active: sql`excluded.active`,
        },
      })
      .returning();
  }
}

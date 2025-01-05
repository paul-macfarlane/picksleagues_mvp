import { Transaction } from "@/db/util";
import { sportGames } from "@/db/schema";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";

export interface UpsertDBSportGame {
  weekId: string;
  startTime: Date;
  status: string;
  clock: string;
  period: number;
  awayTeamId: string;
  awayTeamScore: number;
  homeTeamId: string;
  homeTeamScore: number;
  espnEventId: string | null;
}

interface DBSportGame {
  id: string;
  weekId: string;
  startTime: Date;
  status: string;
  clock: string;
  period: number;
  awayTeamId: string;
  awayTeamScore: number;
  homeTeamId: string;
  homeTeamScore: number;
  espnEventId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function upsertDBSportGames(
  upserts: UpsertDBSportGame[],
  tx?: Transaction,
): Promise<DBSportGame[]> {
  if (tx) {
    return tx
      .insert(sportGames)
      .values(upserts)
      .onConflictDoUpdate({
        target: [sportGames.espnEventId],
        set: {
          status: sql`excluded.status`,
          clock: sql`excluded.clock`,
          period: sql`excluded.period`,
          awayTeamId: sql`excluded.away_team_id`,
          awayTeamScore: sql`excluded.away_team_score`,
          homeTeamId: sql`excluded.home_team_id`,
          homeTeamScore: sql`excluded.home_team_score`,
        },
      })
      .returning();
  } else {
    return db
      .insert(sportGames)
      .values(upserts)
      .onConflictDoUpdate({
        target: [sportGames.espnEventId],
        set: {
          status: sql`excluded.status`,
          clock: sql`excluded.clock`,
          period: sql`excluded.period`,
          awayTeamId: sql`excluded.away_team_id`,
          awayTeamScore: sql`excluded.away_team_score`,
          homeTeamId: sql`excluded.home_team_id`,
          homeTeamScore: sql`excluded.home_team_score`,
        },
      })
      .returning();
  }
}

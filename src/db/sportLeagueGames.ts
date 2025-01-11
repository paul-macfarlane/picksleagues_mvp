import { DBTransaction } from "@/db/transactions";
import { sportLeagueGames } from "@/db/schema";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";

export interface UpsertDBSportLeagueGame {
  weekId: string;
  startTime: Date;
  status: string;
  clock: string;
  period: number;
  awayTeamId: string;
  awayTeamScore: number;
  homeTeamId: string;
  homeTeamScore: number;
  espnId: string | null;
}

export interface DBSportLeagueGame {
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
  espnId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function upsertDBSportGames(
  upserts: UpsertDBSportLeagueGame[],
  tx?: DBTransaction,
): Promise<DBSportLeagueGame[]> {
  if (tx) {
    return tx
      .insert(sportLeagueGames)
      .values(upserts)
      .onConflictDoUpdate({
        target: [sportLeagueGames.espnId],
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
      .insert(sportLeagueGames)
      .values(upserts)
      .onConflictDoUpdate({
        target: [sportLeagueGames.espnId],
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

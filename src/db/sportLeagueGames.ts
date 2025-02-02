import { DBTransaction } from "@/db/transactions";
import { sportLeagueGameOdds, sportLeagueGames } from "@/db/schema";
import { eq, getTableColumns, inArray, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { DBSportLeagueGameOdds } from "@/db/sportLeagueGameOdds";
import { SportLeagueGameStatuses } from "@/models/sportLeagueGames";

export interface UpsertDBSportLeagueGame {
  weekId: string;
  startTime: Date;
  status: SportLeagueGameStatuses;
  clock: string;
  period: number;
  awayTeamId: string;
  awayTeamScore: number;
  homeTeamId: string;
  homeTeamScore: number;
  espnId: string;
  espnOddsRef: string;
}

export interface DBSportLeagueGame {
  id: string;
  weekId: string;
  startTime: Date;
  status: SportLeagueGameStatuses;
  clock: string;
  period: number;
  awayTeamId: string;
  awayTeamScore: number;
  homeTeamId: string;
  homeTeamScore: number;
  espnId: string;
  espnOddsRef: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function upsertDBSportGames(
  upserts: UpsertDBSportLeagueGame[],
  tx?: DBTransaction,
): Promise<DBSportLeagueGame[]> {
  return tx
    ? tx
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
            espnOddsRef: sql`excluded.espn_odds_ref`,
          },
        })
        .returning()
    : db
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
            espnOddsRef: sql`excluded.espn_odds_ref`,
          },
        })
        .returning();
}

export interface DBSportLeagueGameWithOdds extends DBSportLeagueGame {
  odds: DBSportLeagueGameOdds[];
}

export async function getDBSportLeagueGamesWithOddsFromIds(
  ids: string[],
): Promise<DBSportLeagueGameWithOdds[]> {
  const queryRows = await db
    .select({
      sportLeagueGame: getTableColumns(sportLeagueGames),
      sportLeagueGameOdds: getTableColumns(sportLeagueGameOdds),
    })
    .from(sportLeagueGames)
    .innerJoin(
      sportLeagueGameOdds,
      eq(sportLeagueGameOdds.gameId, sportLeagueGames.id),
    )
    .where(inArray(sportLeagueGames.id, ids));

  const games: DBSportLeagueGameWithOdds[] = [];
  for (const row of queryRows) {
    const indexOfGame = games.findIndex(
      (game) => game.id === row.sportLeagueGame.id,
    );
    if (indexOfGame === -1) {
      games.push({
        ...row.sportLeagueGame,
        odds: [row.sportLeagueGameOdds],
      });
    } else {
      games[indexOfGame].odds.push(row.sportLeagueGameOdds);
    }
  }

  return games;
}

export async function getDBSportLeagueGamesForWeek(
  weekId: string,
  tx?: DBTransaction,
): Promise<DBSportLeagueGame[]> {
  return tx
    ? tx
        .select()
        .from(sportLeagueGames)
        .where(eq(sportLeagueGames.weekId, weekId))
    : db
        .select()
        .from(sportLeagueGames)
        .where(eq(sportLeagueGames.weekId, weekId));
}

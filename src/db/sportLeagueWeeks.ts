import {
  oddsProviders,
  picksLeaguePicks,
  picksLeagues,
  sportLeagueGameOdds,
  sportLeagueGames,
  sportLeagues,
  sportLeagueSeasons,
  sportLeagueTeams,
  sportLeagueWeeks,
} from "@/db/schema";
import {
  aliasedTable,
  and,
  eq,
  getTableColumns,
  gt,
  lte,
  sql,
} from "drizzle-orm";
import { db } from "@/db/client";
import { DBTransaction } from "@/db/transactions";
import { DBSportLeagueGame } from "@/db/sportLeagueGames";
import { DbWeeklyPickGameOddsData } from "@/db/sportLeagueGameOdds";
import { DBPicksLeaguePick } from "@/db/picksLeaguesPicks";
import { DBSportLeagueTeam } from "@/db/sportLeagueTeams";

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
  let queryRows;
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

export interface DbWeeklyPickGameData extends DBSportLeagueGame {
  odds: DbWeeklyPickGameOddsData[];
  userPick: DBPicksLeaguePick | null;
  awayTeam: DBSportLeagueTeam;
  homeTeam: DBSportLeagueTeam;
}

export interface DBWeeklyPickData extends DBSportLeagueWeek {
  games: DbWeeklyPickGameData[];
}

export async function getUserDBWeeklyPickData(
  picksLeagueId: string,
  userId: string,
): Promise<DBWeeklyPickData | null> {
  const now = new Date();

  const awayTeamAlias = aliasedTable(sportLeagueTeams, "awaitTeamAlias");
  const homeTeamAlias = aliasedTable(sportLeagueTeams, "homeTeamAlias");

  const queryRows = await db
    .select({
      sportLeagueWeek: getTableColumns(sportLeagueWeeks),
      sportLeagueGame: getTableColumns(sportLeagueGames),
      awayTeamAlias: getTableColumns(awayTeamAlias),
      homeTeamAlias: getTableColumns(homeTeamAlias),
      sportLeagueGameOdds: getTableColumns(sportLeagueGameOdds),
      oddsProviders: getTableColumns(oddsProviders),
    })
    .from(picksLeagues)
    .innerJoin(sportLeagues, eq(picksLeagues.sportLeagueId, sportLeagues.id))
    .innerJoin(
      sportLeagueSeasons,
      eq(sportLeagueSeasons.leagueId, sportLeagues.id),
    )
    .innerJoin(
      sportLeagueWeeks,
      and(
        eq(sportLeagueWeeks.seasonId, sportLeagueSeasons.id),
        lte(sportLeagueWeeks.startTime, now),
        gt(sportLeagueWeeks.endTime, now),
      ),
    )
    .innerJoin(
      sportLeagueGames,
      eq(sportLeagueGames.weekId, sportLeagueWeeks.id),
    )
    .innerJoin(awayTeamAlias, eq(awayTeamAlias.id, sportLeagueGames.awayTeamId))
    .innerJoin(homeTeamAlias, eq(homeTeamAlias.id, sportLeagueGames.homeTeamId))
    .innerJoin(
      sportLeagueGameOdds,
      eq(sportLeagueGameOdds.gameId, sportLeagueGames.id),
    )
    .innerJoin(
      oddsProviders,
      eq(oddsProviders.id, sportLeagueGameOdds.providerId),
    )
    .where(eq(picksLeagues.id, picksLeagueId));
  if (!queryRows.length) {
    return null;
  }

  const week = queryRows[0].sportLeagueWeek;
  const games: DbWeeklyPickGameData[] = [];
  for (const row of queryRows) {
    const indexOfGame = games.findIndex(
      (game) => game.id === row.sportLeagueGame.id,
    );
    if (indexOfGame === -1) {
      games.push({
        ...row.sportLeagueGame,
        awayTeam: row.awayTeamAlias,
        homeTeam: row.homeTeamAlias,
        odds: [
          {
            ...row.sportLeagueGameOdds,
            provider: row.oddsProviders,
          },
        ],
        userPick: null, // may be added later
      });
    } else {
      games[indexOfGame].odds.push({
        ...row.sportLeagueGameOdds,
        provider: row.oddsProviders,
      });
    }
  }

  const picksQueryRows = await db
    .select()
    .from(picksLeaguePicks)
    .where(
      and(
        eq(picksLeaguePicks.leagueId, picksLeagueId),
        eq(picksLeaguePicks.userId, userId),
        eq(picksLeaguePicks.sportLeagueWeekId, week.id),
      ),
    );

  for (const row of picksQueryRows) {
    const gameIndex = games.findIndex(
      (game) => game.id === row.sportLeagueGameId,
    );
    if (gameIndex !== -1) {
      games[gameIndex].userPick = row;
    }
  }

  return {
    ...week,
    games,
  };
}

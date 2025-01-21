import {
  oddsProviders,
  picksLeagueMembers,
  picksLeaguePicks,
  sportLeagueGameOdds,
  sportLeagueGames,
  sportLeagueSeasons,
  sportLeagueTeams,
  sportLeagueWeeks,
  users,
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
import { DBSportLeagueGameOdds } from "@/db/sportLeagueGameOdds";
import { DBPicksLeaguePick } from "@/db/picksLeaguesPicks";
import { DBSportLeagueTeam } from "@/db/sportLeagueTeams";
import { DBUser } from "@/db/users";

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

export async function getCurrentDBSportLeagueWeek(
  sportLeagueId: string,
): Promise<DBSportLeagueWeek | null> {
  const now = new Date();
  const queryRows = await db
    .select({ week: getTableColumns(sportLeagueWeeks) })
    .from(sportLeagueWeeks)
    .innerJoin(
      sportLeagueSeasons,
      eq(sportLeagueSeasons.id, sportLeagueWeeks.seasonId),
    )
    .where(
      and(
        lte(sportLeagueWeeks.startTime, now),
        gt(sportLeagueWeeks.endTime, now),
        eq(sportLeagueSeasons.leagueId, sportLeagueId),
      ),
    );

  return queryRows.length ? queryRows[0].week : null;
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
  odds: DBSportLeagueGameOdds[];
  userPick: DBPicksLeaguePick | null;
  awayTeam: DBSportLeagueTeam;
  homeTeam: DBSportLeagueTeam;
}

export interface DBWeeklyPickData extends DBSportLeagueWeek {
  games: DbWeeklyPickGameData[];
}

export async function getUserDBWeeklyPickData(
  picksLeagueId: string,
  sportsLeagueWeekId: string,
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
    })
    .from(sportLeagueWeeks)
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
    .where(
      and(
        eq(sportLeagueWeeks.id, sportsLeagueWeekId),
        lte(sportLeagueWeeks.startTime, now),
        gt(sportLeagueWeeks.endTime, now),
      ),
    );
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
        odds: [row.sportLeagueGameOdds],
        userPick: null, // may be added later
      });
    } else {
      games[indexOfGame].odds.push(row.sportLeagueGameOdds);
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

export interface DBWeeklyPickDataByUserGame extends DBSportLeagueGame {
  userPick: DBPicksLeaguePick;
  awayTeam: DBSportLeagueTeam;
  homeTeam: DBSportLeagueTeam;
}

export interface DBWeeklyPickDataByUser extends DBUser {
  games: DBWeeklyPickDataByUserGame[];
}

export async function getLeagueDBWeeklyPickDataByUser(
  picksLeagueId: string,
): Promise<DBWeeklyPickDataByUser[]> {
  const awayTeamAlias = aliasedTable(sportLeagueTeams, "awaitTeamAlias");
  const homeTeamAlias = aliasedTable(sportLeagueTeams, "homeTeamAlias");

  const now = new Date();
  const queryRows = await db
    .select({
      user: getTableColumns(users),
      pick: getTableColumns(picksLeaguePicks),
      game: getTableColumns(sportLeagueGames),
      awayTeam: getTableColumns(awayTeamAlias),
      homeTeam: getTableColumns(homeTeamAlias),
    })
    .from(picksLeagueMembers)
    .innerJoin(users, eq(users.id, picksLeaguePicks.userId))
    .leftJoin(
      picksLeaguePicks,
      eq(picksLeaguePicks.userId, picksLeagueMembers.userId),
    )
    .innerJoin(
      sportLeagueWeeks,
      eq(sportLeagueWeeks.id, picksLeaguePicks.sportLeagueWeekId),
    )
    .innerJoin(
      sportLeagueGames,
      eq(sportLeagueGames.id, picksLeaguePicks.sportLeagueGameId),
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
    .where(
      and(
        eq(picksLeagueMembers.leagueId, picksLeagueId),
        lte(sportLeagueWeeks.startTime, now),
        gt(sportLeagueWeeks.endTime, now),
      ),
    );

  const userPickData: DBWeeklyPickDataByUser[] = [];
  queryRows.forEach((row) => {
    const indexOfUser = userPickData.findIndex(
      (user) => user.id === row.user.id,
    );
    if (indexOfUser === -1) {
      userPickData.push({
        ...row.user,
        games:
          row.game && row.pick
            ? [
                {
                  ...row.game,
                  userPick: row.pick,
                  awayTeam: row.awayTeam,
                  homeTeam: row.homeTeam,
                },
              ]
            : [],
      });
    } else if (row.game && row.pick) {
      const indexOfGame = userPickData[indexOfUser].games.findIndex(
        (game) => game.id === row.game.id,
      );
      if (indexOfGame == -1) {
        userPickData[indexOfUser].games.push({
          ...row.game,
          userPick: row.pick,
          awayTeam: row.awayTeam,
          homeTeam: row.homeTeam,
        });
      }
    }
  });

  return userPickData;
}

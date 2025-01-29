import { DBTransaction } from "@/db/transactions";
import {
  picksLeaguePicks,
  sportLeagueGames,
  sportLeagueSeasons,
  sportLeagueWeeks,
} from "@/db/schema";
import { db } from "@/db/client";
import { and, eq, getTableColumns, gte, lte, sql } from "drizzle-orm";
import { DBSportLeagueGame } from "@/db/sportLeagueGames";
import { PicksLeaguePickStatuses } from "@/shared/picksLeaguePicks";
import { SportLeagueGameStatuses } from "@/models/sportLeagueGames";
import { PicksLeaguePickTypes } from "@/models/picksLeagues";

export interface DBPicksLeaguePick {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  leagueId: string;
  spread: number | null;
  userId: string;
  type: PicksLeaguePickTypes;
  sportLeagueWeekId: string;
  sportLeagueGameId: string;
  teamId: string;
  favorite: boolean | null;
  status: PicksLeaguePickStatuses;
}

export interface CreateDBPicksLeaguePick {
  leagueId: string;
  spread: number | null;
  userId: string;
  type: PicksLeaguePickTypes;
  sportLeagueWeekId: string;
  sportLeagueGameId: string;
  teamId: string;
  favorite: boolean | null;
  // status omitted because it defaults to GamePickStatuses.Picked
}

export async function createDBPicksLeaguePicks(
  data: CreateDBPicksLeaguePick[],
  tx?: DBTransaction,
): Promise<DBPicksLeaguePick[]> {
  return tx
    ? await tx.insert(picksLeaguePicks).values(data).returning()
    : db.insert(picksLeaguePicks).values(data).returning();
}

export async function getUserDBPicksLeaguePicksForCurrentWeek(
  userId: string,
  picksLeagueId: string,
  sportLeagueId: string,
): Promise<DBPicksLeaguePick[]> {
  const now = new Date();

  const queryRows = await db
    .select({ picksLeaguePick: getTableColumns(picksLeaguePicks) })
    .from(picksLeaguePicks)
    .innerJoin(
      sportLeagueWeeks,
      eq(sportLeagueWeeks.id, picksLeaguePicks.sportLeagueWeekId),
    )
    .innerJoin(
      sportLeagueSeasons,
      eq(sportLeagueSeasons.id, sportLeagueWeeks.seasonId),
    )
    .where(
      and(
        lte(sportLeagueWeeks.startTime, now),
        gte(sportLeagueWeeks.endTime, now),
        eq(sportLeagueSeasons.leagueId, sportLeagueId),
        eq(picksLeaguePicks.userId, userId),
        eq(picksLeaguePicks.leagueId, picksLeagueId),
      ),
    );

  return queryRows.map((row) => row.picksLeaguePick);
}

export interface DBPicksLeaguePickAndGame {
  pick: DBPicksLeaguePick;
  game: DBSportLeagueGame;
}

export async function getDBPicksFinalizedWithoutStatusForLeague(
  picksLeagueId: string,
  tx?: DBTransaction,
): Promise<DBPicksLeaguePickAndGame[]> {
  return tx
    ? await tx
        .select({
          pick: getTableColumns(picksLeaguePicks),
          game: getTableColumns(sportLeagueGames),
        })
        .from(picksLeaguePicks)
        .innerJoin(
          sportLeagueGames,
          eq(sportLeagueGames.id, picksLeaguePicks.sportLeagueGameId),
        )
        .where(
          and(
            eq(picksLeaguePicks.status, PicksLeaguePickStatuses.PICKED),
            eq(picksLeaguePicks.leagueId, picksLeagueId),
            eq(sportLeagueGames.status, SportLeagueGameStatuses.FINAL),
          ),
        )
    : await db
        .select({
          pick: getTableColumns(picksLeaguePicks),
          game: getTableColumns(sportLeagueGames),
        })
        .from(picksLeaguePicks)
        .innerJoin(
          sportLeagueGames,
          eq(sportLeagueGames.id, picksLeaguePicks.sportLeagueGameId),
        )
        .where(
          and(
            eq(picksLeaguePicks.status, PicksLeaguePickStatuses.PICKED),
            eq(picksLeaguePicks.leagueId, picksLeagueId),
            eq(sportLeagueGames.status, SportLeagueGameStatuses.FINAL),
          ),
        );
}

export interface UpsertDBPicksLeaguePick {
  id?: string;
  leagueId: string;
  spread: number | null;
  userId: string;
  type: PicksLeaguePickTypes;
  sportLeagueWeekId: string;
  sportLeagueGameId: string;
  teamId: string;
  favorite: boolean | null;
  status: PicksLeaguePickStatuses;
}

export async function upsertDBPicksLeaguePicks(
  upserts: UpsertDBPicksLeaguePick[],
  tx?: DBTransaction,
): Promise<DBPicksLeaguePick[]> {
  return tx
    ? await tx
        .insert(picksLeaguePicks)
        .values(upserts)
        .onConflictDoUpdate({
          target: [picksLeaguePicks.id],
          set: {
            leagueId: sql`excluded.league_id`,
            spread: sql`excluded.spread`,
            userId: sql`excluded.user_id`,
            type: sql`excluded.type`,
            sportLeagueWeekId: sql`excluded.sport_league_week_id`,
            sportLeagueGameId: sql`excluded.sport_league_game_id`,
            teamId: sql`excluded.team_id`,
            favorite: sql`excluded.favorite`,
            status: sql`excluded.status`,
          },
        })
        .returning()
    : await db
        .insert(picksLeaguePicks)
        .values(upserts)
        .onConflictDoUpdate({
          target: [picksLeaguePicks.id],
          set: {
            leagueId: sql`excluded.league_id`,
            spread: sql`excluded.spread`,
            userId: sql`excluded.user_id`,
            type: sql`excluded.type`,
            sportLeagueWeekId: sql`excluded.sport_league_week_id`,
            sportLeagueGameId: sql`excluded.sport_league_game_id`,
            teamId: sql`excluded.team_id`,
            favorite: sql`excluded.favorite`,
            status: sql`excluded.status`,
          },
        })
        .returning();
}

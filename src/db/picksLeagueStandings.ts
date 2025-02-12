import {
  picksLeagueSeasons,
  picksLeagueStandings,
  sportLeagueWeeks,
  users,
} from "@/db/schema";
import { and, eq, getTableColumns, gt, inArray, sql } from "drizzle-orm";
import { DBTransaction } from "@/db/transactions";
import { db } from "@/db/client";
import { DBUser } from "@/db/users";

export interface DBPicksLeagueStandings {
  id: string;
  userId: string;
  seasonId: string;
  wins: number;
  losses: number;
  pushes: number;
  points: number;
  rank: number;
  createdAt: Date;
  updatedAt: Date;
}

export async function getDBPicksLeagueStandingsForSeason(
  seasonId: string,
  orderByRank: boolean,
  tx?: DBTransaction,
): Promise<DBPicksLeagueStandings[]> {
  return tx
    ? await tx
        .select()
        .from(picksLeagueStandings)
        .where(eq(picksLeagueStandings.seasonId, seasonId))
        .orderBy(
          orderByRank ? picksLeagueStandings.rank : picksLeagueStandings.id,
        )
    : await db
        .select()
        .from(picksLeagueStandings)
        .where(eq(picksLeagueStandings.seasonId, seasonId))
        .orderBy(
          orderByRank ? picksLeagueStandings.rank : picksLeagueStandings.id,
        );
}

export interface UpsertDBPicksLeagueStandings {
  id?: string;
  userId: string;
  seasonId: string;
  wins: number;
  losses: number;
  pushes: number;
  points: number;
  rank: number;
}

export async function upsertDBPicksLeagueStandings(
  upserts: UpsertDBPicksLeagueStandings[],
  tx?: DBTransaction,
): Promise<DBPicksLeagueStandings[]> {
  return tx
    ? await tx
        .insert(picksLeagueStandings)
        .values(upserts)
        .onConflictDoUpdate({
          target: [picksLeagueStandings.id],
          set: {
            userId: sql`excluded.user_id`,
            seasonId: sql`excluded.season_id`,
            wins: sql`excluded.wins`,
            losses: sql`excluded.losses`,
            pushes: sql`excluded.pushes`,
            points: sql`excluded.points`,
            rank: sql`excluded.rank`,
          },
        })
        .returning()
    : await db
        .insert(picksLeagueStandings)
        .values(upserts)
        .onConflictDoUpdate({
          target: [picksLeagueStandings.id],
          set: {
            userId: sql`excluded.user_id`,
            seasonId: sql`excluded.season_id`,
            wins: sql`excluded.wins`,
            losses: sql`excluded.losses`,
            pushes: sql`excluded.pushes`,
            points: sql`excluded.points`,
            rank: sql`excluded.rank`,
          },
        })
        .returning();
}

export interface DBPicksLeagueStandingsWithMembers {
  standings: DBPicksLeagueStandings;
  user: DBUser;
}

export async function getDBPicksLeagueSeasonStandingsWithMembers(
  picksLeagueSeasonId: string,
): Promise<DBPicksLeagueStandingsWithMembers[]> {
  return db
    .select({
      standings: getTableColumns(picksLeagueStandings),
      user: getTableColumns(users),
    })
    .from(picksLeagueSeasons)
    .innerJoin(
      picksLeagueStandings,
      eq(picksLeagueStandings.seasonId, picksLeagueSeasons.id),
    )
    .innerJoin(users, eq(picksLeagueStandings.userId, users.id))
    .where(eq(picksLeagueSeasons.id, picksLeagueSeasonId))
    .orderBy(picksLeagueStandings.rank);
}

export async function deleteDBPicksLeagueStandingsRecord(
  userId: string,
  seasonId: string,
  tx?: DBTransaction,
): Promise<void> {
  if (tx) {
    await tx
      .delete(picksLeagueStandings)
      .where(
        and(
          eq(picksLeagueStandings.userId, userId),
          eq(picksLeagueStandings.seasonId, seasonId),
        ),
      );
  } else {
    await db
      .delete(picksLeagueStandings)
      .where(
        and(
          eq(picksLeagueStandings.userId, userId),
          eq(picksLeagueStandings.seasonId, seasonId),
        ),
      );
  }
}

export async function getUserDBPicksLeagueStandingsForFutureSeasons(
  userId: string,
): Promise<DBPicksLeagueStandings[]> {
  const now = new Date();
  const queryRows = await db
    .select({
      standings: getTableColumns(picksLeagueStandings),
    })
    .from(picksLeagueStandings)
    .innerJoin(
      picksLeagueSeasons,
      eq(picksLeagueSeasons.id, picksLeagueStandings.seasonId),
    )
    .innerJoin(
      sportLeagueWeeks,
      eq(picksLeagueSeasons.startSportLeagueWeekId, sportLeagueWeeks.id),
    )
    .where(
      and(
        eq(picksLeagueStandings.userId, userId),
        gt(sportLeagueWeeks.startTime, now),
      ),
    );

  return queryRows.map((row) => row.standings);
}

export async function deleteDBPicksLeagueStandingsByIds(
  ids: string[],
  tx?: DBTransaction,
): Promise<void> {
  if (tx) {
    await tx
      .delete(picksLeagueStandings)
      .where(inArray(picksLeagueStandings.id, ids));
  } else {
    await db
      .delete(picksLeagueStandings)
      .where(inArray(picksLeagueStandings.id, ids));
  }
}

export async function getDBPicksLeagueStandingsForUserAndSeason(
  userId: string,
  seasonId: string,
): Promise<DBPicksLeagueStandings | null> {
  const queryRows = await db
    .select()
    .from(picksLeagueStandings)
    .where(
      and(
        eq(picksLeagueStandings.userId, userId),
        eq(picksLeagueStandings.seasonId, seasonId),
      ),
    );
  return queryRows[0] || null;
}

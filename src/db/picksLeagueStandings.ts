import { picksLeagueSeasons, picksLeagueStandings, users } from "@/db/schema";
import { and, eq, getTableColumns, sql } from "drizzle-orm";
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

export async function getDBPicksLeagueStandingsWithMembers(
  picksLeagueId: string,
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
    .where(
      and(
        eq(picksLeagueSeasons.active, true),
        eq(picksLeagueSeasons.leagueId, picksLeagueId),
      ),
    )
    .orderBy(picksLeagueStandings.rank);
}

import { LeagueVisibilities, PickTypes } from "@/models/leagues";
import { db } from "./client";
import {
  leagueMembers,
  leagues,
  leagueSeasons,
  sports,
  sportWeeks,
} from "./schema";
import { Transaction as DBTransaction } from "./util";
import {
  aliasedTable,
  and,
  eq,
  getTableColumns,
  gte,
  isNull,
  sql,
} from "drizzle-orm";

export interface DBLeague {
  id: string;
  name: string;
  logoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  sportId: string;
  picksPerWeek: number;
  pickType: string;
  leagueVisibility: string;
  size: number;
}

interface CreateDBLeague {
  name: string;
  logoUrl?: string;
  sportId: string;
  picksPerWeek: number;
  pickType: PickTypes;
  leagueVisibility: LeagueVisibilities;
  size: number;
}

export async function createDBLeague(
  data: CreateDBLeague,
  tx?: DBTransaction,
): Promise<DBLeague | null> {
  const queryRows = tx
    ? await tx.insert(leagues).values(data).returning()
    : await db.insert(leagues).values(data).returning();
  if (!queryRows.length) {
    return null;
  }

  return queryRows[0];
}

interface CreateDBLeagueSeason {
  leagueId: string;
  sportSeasonId: string;
  startSportWeekId: string;
  endSportWeekId: string;
  active: boolean;
}

interface DBLeagueSeason {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  leagueId: string;
  sportSeasonId: string;
  startSportWeekId: string;
  endSportWeekId: string;
}

export async function createDBLeagueSeason(
  data: CreateDBLeagueSeason,
  tx?: DBTransaction,
): Promise<DBLeagueSeason | null> {
  const queryRows = tx
    ? await tx.insert(leagueSeasons).values(data).returning()
    : await db.insert(leagueSeasons).values(data).returning();
  if (!queryRows.length) {
    return null;
  }

  return queryRows[0];
}

interface CreateDBLeagueMember {
  userId: string;
  leagueId: string;
  role: string;
}

interface DBLeagueMember {
  createdAt: Date;
  updatedAt: Date;
  leagueId: string;
  userId: string;
  role: string;
}

export async function createDBLeagueMember(
  data: CreateDBLeagueMember,
  tx?: DBTransaction,
): Promise<DBLeagueMember | null> {
  const queryRows = tx
    ? await tx.insert(leagueMembers).values(data).returning()
    : await db.insert(leagueMembers).values(data).returning();
  if (!queryRows.length) {
    return null;
  }

  return queryRows[0];
}

interface DBLeagueDetails extends DBLeague {
  sportName: string;
}

export async function getDBLeagueDetailsForUser(
  userId: string,
): Promise<DBLeagueDetails[]> {
  const queryRows = await db
    .select()
    .from(leagueMembers)
    .where(eq(leagueMembers.userId, userId))
    .innerJoin(leagues, eq(leagueMembers.leagueId, leagues.id))
    .innerJoin(sports, eq(leagues.sportId, sports.id));

  return queryRows.map((row) => ({
    ...row.leagues,
    sportName: row.sports.name,
  }));
}

interface filterDBLeaguesParams {
  sportId?: string;
  pickType?: string;
  picksPerWeek?: number;
  startWeekId?: string;
  endWeekId?: string;
  size?: number;
}

export interface DBLeagueDetailsWithWeek extends DBLeagueDetails {
  startWeekName: string;
  endWeekName: string;
  memberCount: number;
}

export async function filterDBLeagues(
  params: filterDBLeaguesParams,
  userId: string,
  limit: number,
  offset: number,
): Promise<{
  leagues: DBLeagueDetailsWithWeek[];
  total: number;
}> {
  const sportsJoin = params.sportId
    ? and(eq(leagues.sportId, sports.id), eq(sports.id, params.sportId))
    : eq(leagues.sportId, sports.id);

  const startWeeksAlias = aliasedTable(sportWeeks, "startWeeks");
  let startWeekJoinClauses = [
    eq(startWeeksAlias.id, leagueSeasons.startSportWeekId),
    gte(startWeeksAlias.startTime, new Date()),
  ];
  if (params.startWeekId) {
    startWeekJoinClauses.push(eq(startWeeksAlias.id, params.startWeekId));
  }
  const startWeekJoinClause = and(...startWeekJoinClauses);

  const endWeeksAlias = aliasedTable(sportWeeks, "endWeeks");
  let endWeekJoinClauses = [
    eq(endWeeksAlias.id, leagueSeasons.endSportWeekId),
    gte(endWeeksAlias.startTime, new Date()),
  ];
  if (params.endWeekId) {
    endWeekJoinClauses.push(eq(endWeeksAlias.id, params.endWeekId));
  }
  const endWeekJoinClause = and(...endWeekJoinClauses);

  const whereClauses = [
    eq(leagues.leagueVisibility, LeagueVisibilities.LEAGUE_VISIBILITY_PUBLIC),
    isNull(leagueMembers.leagueId),
  ];
  if (params.pickType) {
    whereClauses.push(eq(leagues.pickType, params.pickType));
  }
  if (params.picksPerWeek) {
    whereClauses.push(eq(leagues.picksPerWeek, params.picksPerWeek));
  }
  if (params.size) {
    whereClauses.push(eq(leagues.size, params.size));
  }

  const otherMembersAlias = aliasedTable(leagueMembers, "otherMembers");

  const whereClause = and(...whereClauses);

  const queryRows = await db
    .select({
      leagues: getTableColumns(leagues),
      sports: getTableColumns(sports),
      startWeeks: getTableColumns(startWeeksAlias),
      endWeeks: getTableColumns(endWeeksAlias),
      otherMembers: getTableColumns(otherMembersAlias),
      memberCount: sql<number>`cast(count(${otherMembersAlias.userId}) as int)`,
    })
    .from(leagues)
    .innerJoin(sports, sportsJoin)
    .innerJoin(
      leagueSeasons,
      and(
        eq(leagues.id, leagueSeasons.leagueId),
        eq(leagueSeasons.active, true),
      ),
    )
    .innerJoin(startWeeksAlias, startWeekJoinClause)
    .innerJoin(endWeeksAlias, endWeekJoinClause)
    .leftJoin(otherMembersAlias, eq(otherMembersAlias.leagueId, leagues.id))
    .leftJoin(
      leagueMembers,
      and(
        eq(leagueMembers.userId, userId),
        eq(leagueMembers.leagueId, leagues.id),
      ),
    )
    .where(whereClause)
    .groupBy(leagues.id)
    .having(sql`count(${otherMembersAlias.userId}) < ${leagues.size}`)
    .limit(limit)
    .offset(offset);

  const leagueDetails = queryRows.map((row) => ({
    ...row.leagues,
    sportName: row.sports.name,
    startWeekName: row.startWeeks.name,
    endWeekName: row.endWeeks.name,
    memberCount: row.memberCount,
  }));

  const countQueryRes = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(leagues)
    .innerJoin(sports, sportsJoin)
    .innerJoin(
      leagueSeasons,
      and(
        eq(leagues.id, leagueSeasons.leagueId),
        eq(leagueSeasons.active, true),
      ),
    )
    .innerJoin(startWeeksAlias, startWeekJoinClause)
    .innerJoin(endWeeksAlias, endWeekJoinClause)
    .leftJoin(otherMembersAlias, eq(otherMembersAlias.leagueId, leagues.id))
    .leftJoin(
      leagueMembers,
      and(
        eq(leagueMembers.userId, userId),
        eq(leagueMembers.leagueId, leagues.id),
      ),
    )
    .where(whereClause)
    .groupBy(leagues.id)
    .having(sql`count(${otherMembersAlias.userId}) < ${leagues.size}`);
  const count = countQueryRes.length > 0 ? countQueryRes[0].count : 0;

  return {
    leagues: leagueDetails,
    total: count,
  };
}

export async function getDBLeagueById(id: string): Promise<DBLeague | null> {
  const queryRows = await db.select().from(leagues).where(eq(leagues.id, id));
  if (!queryRows.length) {
    return null;
  }

  return queryRows[0];
}

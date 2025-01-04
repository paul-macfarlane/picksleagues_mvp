import {
  LeagueMemberRoles,
  LeagueVisibilities,
  PickTypes,
} from "@/models/leagues";
import { db } from "./client";
import {
  leagueInvites,
  leagueMembers,
  leagues,
  leagueSeasons,
  sportLeagues,
  sportWeeks,
  users,
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
import { DBUser } from "./users";

export interface DBLeague {
  id: string;
  name: string;
  logoUrl: string | null;
  sportLeagueId: string;
  picksPerWeek: number;
  pickType: string;
  leagueVisibility: string;
  size: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateDBLeague {
  name: string;
  logoUrl?: string;
  sportLeagueId: string;
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

export interface DBLeagueDetails extends DBLeague {
  sportLeagueAbbreviation: string;
}

export async function getDBLeagueDetailsForUser(
  userId: string,
  limit?: number,
): Promise<DBLeagueDetails[]> {
  const queryRows = await db
    .select()
    .from(leagueMembers)
    .where(eq(leagueMembers.userId, userId))
    .innerJoin(leagues, eq(leagueMembers.leagueId, leagues.id))
    .innerJoin(sportLeagues, eq(leagues.sportLeagueId, sportLeagues.id))
    .limit(limit ?? 100); // todo maybe should enforce that a user can only be in so many leagues

  return queryRows.map((row) => ({
    ...row.leagues,
    sportLeagueAbbreviation: row.sports_leagues.abbreviation,
  }));
}

interface filterDBLeaguesParams {
  sportLeagueId?: string;
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
  const sportLeaguesJoin = params.sportLeagueId
    ? and(
        eq(leagues.sportLeagueId, sportLeagues.id),
        eq(sportLeagues.id, params.sportLeagueId),
      )
    : eq(leagues.sportLeagueId, sportLeagues.id);

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
      sportLeagues: getTableColumns(sportLeagues),
      startWeeks: getTableColumns(startWeeksAlias),
      endWeeks: getTableColumns(endWeeksAlias),
      otherMembers: getTableColumns(otherMembersAlias),
      memberCount: sql<number>`cast
          (count(${otherMembersAlias.userId}) as int)`,
    })
    .from(leagues)
    .innerJoin(sportLeagues, sportLeaguesJoin)
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
    .having(
      sql`count
          (${otherMembersAlias.userId})
          <
          ${leagues.size}`,
    )
    .limit(limit)
    .offset(offset);

  const leagueDetails = queryRows.map((row) => ({
    ...row.leagues,
    sportLeagueAbbreviation: row.sportLeagues.abbreviation,
    startWeekName: row.startWeeks.name,
    endWeekName: row.endWeeks.name,
    memberCount: row.memberCount,
  }));

  const countQueryRes = await db
    .select({
      count: sql`count
          (*)`.mapWith(Number),
    })
    .from(leagues)
    .innerJoin(sportLeagues, sportLeaguesJoin)
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
    .groupBy(leagues.id).having(sql`count
              (${otherMembersAlias.userId})
              <
              ${leagues.size}`);
  const count = countQueryRes.length > 0 ? countQueryRes[0].count : 0;

  return {
    leagues: leagueDetails,
    total: count,
  };
}

interface DBLeagueWithMemberCount extends DBLeague {
  memberCount: number;
}

export async function getDBLeagueByIdWithMemberCount(
  id: string,
): Promise<DBLeagueWithMemberCount | null> {
  const queryRows = await db
    .select({
      leagues: getTableColumns(leagues),
      memberCount: sql<number>`cast
          (count(${leagueMembers.userId}) as int)`,
    })
    .from(leagues)
    .leftJoin(leagueMembers, eq(leagueMembers.leagueId, leagues.id))
    .where(eq(leagues.id, id))
    .groupBy(leagues.id);
  if (!queryRows.length) {
    return null;
  }

  return {
    ...queryRows[0].leagues,
    memberCount: queryRows[0].memberCount,
  };
}

interface LeagueDetailsForInvite extends DBLeague {
  memberCount: number;
  invite: DBLeagueInvite;
}

export async function getLeagueDetailsForInvite(
  inviteId: string,
): Promise<LeagueDetailsForInvite | null> {
  const queryRows = await db
    .select({
      invites: getTableColumns(leagueInvites),
      leagues: getTableColumns(leagues),
      memberCount: sql<number>`cast
          (count(${leagueMembers.userId}) as int)`,
    })
    .from(leagues)
    .innerJoin(leagueInvites, eq(leagueInvites.id, inviteId))
    .leftJoin(leagueMembers, eq(leagueMembers.leagueId, leagues.id))
    .groupBy(leagues.id);
  if (!queryRows.length) {
    return null;
  }

  return {
    ...queryRows[0].leagues,
    memberCount: queryRows[0].memberCount,
    invite: queryRows[0].invites,
  };
}

interface DBLeagueWithUserRole extends DBLeagueDetails {
  role: LeagueMemberRoles;
}

export async function getDBLeagueByIdWithUserRole(
  leagueId: string,
  userId: string,
): Promise<DBLeagueWithUserRole | null> {
  const queryRows = await db
    .select({
      league: getTableColumns(leagues),
      role: leagueMembers.role,
      sportLeagueAbbreviation: sportLeagues.abbreviation,
    })
    .from(leagues)
    .leftJoin(leagueMembers, eq(leagueMembers.userId, userId))
    .innerJoin(sportLeagues, eq(leagues.sportLeagueId, sportLeagues.id))
    .where(eq(leagues.id, leagueId));
  if (!queryRows.length) {
    return null;
  }

  return {
    ...queryRows[0].league,
    sportLeagueAbbreviation: queryRows[0].sportLeagueAbbreviation,
    role: (queryRows[0].role as LeagueMemberRoles) ?? LeagueMemberRoles.NONE,
  };
}

interface LeagueMemberDetails extends DBUser {
  role: LeagueMemberRoles;
}

export async function getLeagueMemberDetails(
  leagueId: string,
): Promise<LeagueMemberDetails[]> {
  const queryRows = await db
    .select()
    .from(leagueMembers)
    .innerJoin(users, eq(users.id, leagueMembers.userId))
    .where(eq(leagueMembers.leagueId, leagueId));

  return queryRows.map((row) => ({
    ...row.users,
    role: row.league_members.role as LeagueMemberRoles,
  }));
}

interface CreateDBLeagueInvite {
  leagueId: string;
  expiresAt: Date;
}

interface DBLeagueInvite {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  leagueId: string;
  acceptedByUserId: string | null;
  expiresAt: Date;
}

export async function createDBLeagueInvite(
  data: CreateDBLeagueInvite,
): Promise<DBLeagueInvite | null> {
  const queryRes = await db
    .insert(leagueInvites)
    .values({ ...data })
    .returning();
  if (!queryRes.length) {
    return null;
  }

  return queryRes[0];
}

export async function getDBLeagueMember(
  leagueId: string,
  userId: string,
): Promise<DBLeagueMember | null> {
  const queryRows = await db
    .select()
    .from(leagueMembers)
    .where(
      and(
        eq(leagueMembers.userId, userId),
        eq(leagueMembers.leagueId, leagueId),
      ),
    );
  if (!queryRows.length) {
    return null;
  }

  return queryRows[0];
}

export async function accceptDBLeagueInvite(
  userId: string,
  leagueInviteId: string,
  tx?: DBTransaction,
): Promise<void> {
  if (tx) {
    await tx
      .update(leagueInvites)
      .set({ acceptedByUserId: userId })
      .where(eq(leagueInvites.id, leagueInviteId));
  } else {
    await db
      .update(leagueInvites)
      .set({ acceptedByUserId: userId })
      .where(eq(leagueInvites.id, leagueInviteId));
  }
}

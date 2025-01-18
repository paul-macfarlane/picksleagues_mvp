import {
  PicksLeaguePickTypes,
  PicksLeagueVisibilities,
} from "@/models/picksLeagues";
import { db } from "./client";
import {
  picksLeagueMembers,
  picksLeagues,
  picksLeagueSeasons,
  sportLeagues,
  sportLeagueWeeks,
} from "./schema";
import { DBTransaction } from "./transactions";
import {
  aliasedTable,
  and,
  eq,
  getTableColumns,
  gte,
  isNull,
  sql,
} from "drizzle-orm";
import { PicksLeagueMemberRoles } from "@/models/picksLeagueMembers";
import { DBSportLeagueWeek } from "@/db/sportLeagueWeeks";
import { DBPicksLeagueMember } from "@/db/picksLeagueMembers";

export interface DBPicksLeague {
  id: string;
  name: string;
  logoUrl: string | null;
  sportLeagueId: string;
  picksPerWeek: number;
  pickType: string;
  visibility: string;
  size: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDBPicksLeague {
  name: string;
  logoUrl?: string;
  sportLeagueId: string;
  picksPerWeek: number;
  pickType: PicksLeaguePickTypes;
  visibility: PicksLeagueVisibilities;
  size: number;
}

export async function createDBPicksLeague(
  data: CreateDBPicksLeague,
  tx?: DBTransaction,
): Promise<DBPicksLeague | null> {
  const queryRows = tx
    ? await tx.insert(picksLeagues).values(data).returning()
    : await db.insert(picksLeagues).values(data).returning();
  if (!queryRows.length) {
    return null;
  }

  return queryRows[0];
}

export interface DBPicksLeagueDetails extends DBPicksLeague {
  sportLeagueAbbreviation: string;
}

export async function getDBPicksLeagueDetailsForUser(
  userId: string,
  limit?: number,
): Promise<DBPicksLeagueDetails[]> {
  const queryRows = await db
    .select()
    .from(picksLeagueMembers)
    .where(eq(picksLeagueMembers.userId, userId))
    .innerJoin(picksLeagues, eq(picksLeagueMembers.leagueId, picksLeagues.id))
    .innerJoin(sportLeagues, eq(picksLeagues.sportLeagueId, sportLeagues.id))
    .limit(limit ?? 10); // todo maybe should enforce that a user can only be in so many picks-sport-leagues

  return queryRows.map((row) => ({
    ...row.picks_leagues,
    sportLeagueAbbreviation: row.sports_leagues.abbreviation,
  }));
}

export interface filterDBPicksLeaguesParams {
  sportLeagueId?: string;
  pickType?: string;
  picksPerWeek?: number;
  startSportLeagueWeekId?: string;
  endSportLeagueWeekId?: string;
  size?: number;
}

export interface DBPicksLeagueDetailsWithWeek extends DBPicksLeagueDetails {
  startSportLeagueWeekName: string;
  endSportLeagueWeekName: string;
  memberCount: number;
}

export async function filterDBPicksLeagues(
  params: filterDBPicksLeaguesParams,
  userId: string,
  limit: number,
  offset: number,
): Promise<{
  leagues: DBPicksLeagueDetailsWithWeek[];
  total: number;
}> {
  const sportLeaguesJoin = params.sportLeagueId
    ? and(
        eq(picksLeagues.sportLeagueId, sportLeagues.id),
        eq(sportLeagues.id, params.sportLeagueId),
      )
    : eq(picksLeagues.sportLeagueId, sportLeagues.id);

  const startSportLeagueWeeksAlias = aliasedTable(
    sportLeagueWeeks,
    "startWeeks",
  );
  let startSportLeagueWeekJoinClauses = [
    eq(
      startSportLeagueWeeksAlias.id,
      picksLeagueSeasons.startSportLeagueWeekId,
    ),
    gte(startSportLeagueWeeksAlias.startTime, new Date()),
  ];
  if (params.startSportLeagueWeekId) {
    startSportLeagueWeekJoinClauses.push(
      eq(startSportLeagueWeeksAlias.id, params.startSportLeagueWeekId),
    );
  }
  const startSportLeagueWeekJoinClause = and(
    ...startSportLeagueWeekJoinClauses,
  );

  const endSportLeagueWeeksAlias = aliasedTable(sportLeagueWeeks, "endWeeks");
  let endSportLeagueWeekJoinClauses = [
    eq(endSportLeagueWeeksAlias.id, picksLeagueSeasons.endSportLeagueWeekId),
    gte(endSportLeagueWeeksAlias.startTime, new Date()),
  ];
  if (params.endSportLeagueWeekId) {
    endSportLeagueWeekJoinClauses.push(
      eq(endSportLeagueWeeksAlias.id, params.endSportLeagueWeekId),
    );
  }
  const endSportWeekJoinClause = and(...endSportLeagueWeekJoinClauses);

  const whereClauses = [
    eq(picksLeagues.visibility, PicksLeagueVisibilities.PUBLIC),
    isNull(picksLeagueMembers.leagueId),
  ];
  if (params.pickType) {
    whereClauses.push(eq(picksLeagues.pickType, params.pickType));
  }
  if (params.picksPerWeek) {
    whereClauses.push(eq(picksLeagues.picksPerWeek, params.picksPerWeek));
  }
  if (params.size) {
    whereClauses.push(eq(picksLeagues.size, params.size));
  }

  const otherLeagueMembersAlias = aliasedTable(
    picksLeagueMembers,
    "otherMembers",
  );

  const whereClause = and(...whereClauses);

  const queryRows = await db
    .select({
      leagues: getTableColumns(picksLeagues),
      sportLeagues: getTableColumns(sportLeagues),
      startWeeks: getTableColumns(startSportLeagueWeeksAlias),
      endWeeks: getTableColumns(endSportLeagueWeeksAlias),
      otherMembers: getTableColumns(otherLeagueMembersAlias),
      memberCount: sql<number>`cast
          (count(${otherLeagueMembersAlias.userId}) as int)`,
    })
    .from(picksLeagues)
    .innerJoin(sportLeagues, sportLeaguesJoin)
    .innerJoin(
      picksLeagueSeasons,
      and(
        eq(picksLeagues.id, picksLeagueSeasons.leagueId),
        eq(picksLeagueSeasons.active, true),
      ),
    )
    .innerJoin(startSportLeagueWeeksAlias, startSportLeagueWeekJoinClause)
    .innerJoin(endSportLeagueWeeksAlias, endSportWeekJoinClause)
    .leftJoin(
      otherLeagueMembersAlias,
      eq(otherLeagueMembersAlias.leagueId, picksLeagues.id),
    )
    .leftJoin(
      picksLeagueMembers,
      and(
        eq(picksLeagueMembers.userId, userId),
        eq(picksLeagueMembers.leagueId, picksLeagues.id),
      ),
    )
    .where(whereClause)
    .groupBy(picksLeagues.id)
    .having(
      sql`count
          (${otherLeagueMembersAlias.userId})
          <
          ${picksLeagues.size}`,
    )
    .limit(limit)
    .offset(offset);

  const picksLeagueDetails = queryRows.map((row) => ({
    ...row.leagues,
    sportLeagueAbbreviation: row.sportLeagues.abbreviation,
    startSportLeagueWeekName: row.startWeeks.name,
    endSportLeagueWeekName: row.endWeeks.name,
    memberCount: row.memberCount,
  }));

  const countQueryRes = await db
    .select({
      count: sql`count
          (*)`.mapWith(Number),
    })
    .from(picksLeagues)
    .innerJoin(sportLeagues, sportLeaguesJoin)
    .innerJoin(
      picksLeagueSeasons,
      and(
        eq(picksLeagues.id, picksLeagueSeasons.leagueId),
        eq(picksLeagueSeasons.active, true),
      ),
    )
    .innerJoin(startSportLeagueWeeksAlias, startSportLeagueWeekJoinClause)
    .innerJoin(endSportLeagueWeeksAlias, endSportWeekJoinClause)
    .leftJoin(
      otherLeagueMembersAlias,
      eq(otherLeagueMembersAlias.leagueId, picksLeagues.id),
    )
    .leftJoin(
      picksLeagueMembers,
      and(
        eq(picksLeagueMembers.userId, userId),
        eq(picksLeagueMembers.leagueId, picksLeagues.id),
      ),
    )
    .where(whereClause)
    .groupBy(picksLeagues.id).having(sql`count
              (${otherLeagueMembersAlias.userId})
              <
              ${picksLeagues.size}`);
  const count = countQueryRes.length > 0 ? countQueryRes[0].count : 0;

  return {
    leagues: picksLeagueDetails,
    total: count,
  };
}

export interface DBPicksLeagueWithMemberCount extends DBPicksLeague {
  memberCount: number;
}

export async function getDBPicksLeagueByIdWithMemberCount(
  id: string,
): Promise<DBPicksLeagueWithMemberCount | null> {
  const queryRows = await db
    .select({
      leagues: getTableColumns(picksLeagues),
      memberCount: sql<number>`cast
          (count(${picksLeagueMembers.userId}) as int)`,
    })
    .from(picksLeagues)
    .leftJoin(
      picksLeagueMembers,
      eq(picksLeagueMembers.leagueId, picksLeagues.id),
    )
    .where(eq(picksLeagues.id, id))
    .groupBy(picksLeagues.id);
  if (!queryRows.length) {
    return null;
  }

  return {
    ...queryRows[0].leagues,
    memberCount: queryRows[0].memberCount,
  };
}

export interface DBPicksLeagueWithUserRole extends DBPicksLeagueDetails {
  role: PicksLeagueMemberRoles;
}

export async function getDBPicksLeagueByIdWithUserRole(
  picksLeagueId: string,
  userId: string,
): Promise<DBPicksLeagueWithUserRole | null> {
  const queryRows = await db
    .select({
      picksLeague: getTableColumns(picksLeagues),
      role: picksLeagueMembers.role,
      sportLeagueAbbreviation: sportLeagues.abbreviation,
    })
    .from(picksLeagues)
    .leftJoin(picksLeagueMembers, eq(picksLeagueMembers.userId, userId))
    .innerJoin(sportLeagues, eq(picksLeagues.sportLeagueId, sportLeagues.id))
    .where(eq(picksLeagues.id, picksLeagueId));
  if (!queryRows.length) {
    return null;
  }

  return {
    ...queryRows[0].picksLeague,
    sportLeagueAbbreviation: queryRows[0].sportLeagueAbbreviation,
    role:
      (queryRows[0].role as PicksLeagueMemberRoles) ??
      PicksLeagueMemberRoles.NONE,
  };
}

export interface DBPicksLeagueSettingDetails extends DBPicksLeague {
  startSportLeagueWeek: DBSportLeagueWeek;
  endSportLeagueWeek: DBSportLeagueWeek;
}

export async function getPickLeagueSettingsDetails(
  leagueId: string,
): Promise<DBPicksLeagueSettingDetails | null> {
  const startSportLeagueWeeksAlias = aliasedTable(
    sportLeagueWeeks,
    "startWeeks",
  );
  const endSportLeagueWeeksAlias = aliasedTable(sportLeagueWeeks, "endWeeks");

  const queryRows = await db
    .select({
      picksLeague: getTableColumns(picksLeagues),
      startSportLeagueWeek: getTableColumns(startSportLeagueWeeksAlias),
      endSportLeagueWeek: getTableColumns(endSportLeagueWeeksAlias),
    })
    .from(picksLeagues)
    .innerJoin(
      picksLeagueSeasons,
      and(
        eq(picksLeagues.id, picksLeagueSeasons.leagueId),
        eq(picksLeagueSeasons.active, true),
      ),
    )
    .innerJoin(
      startSportLeagueWeeksAlias,
      eq(
        picksLeagueSeasons.startSportLeagueWeekId,
        startSportLeagueWeeksAlias.id,
      ),
    )
    .innerJoin(
      endSportLeagueWeeksAlias,
      eq(picksLeagueSeasons.endSportLeagueWeekId, endSportLeagueWeeksAlias.id),
    )
    .where(eq(picksLeagues.id, leagueId));
  if (!queryRows.length) {
    return null;
  }

  return {
    ...queryRows[0].picksLeague,
    startSportLeagueWeek: queryRows[0].startSportLeagueWeek,
    endSportLeagueWeek: queryRows[0].endSportLeagueWeek,
  };
}

export interface UpdateDBPicksLeague {
  name?: string;
  logoUrl?: string | null;
  sportLeagueId?: string;
  picksPerWeek?: number;
  pickType?: PicksLeaguePickTypes;
  visibility?: PicksLeagueVisibilities;
  size?: number;
}

export async function updateDBPicksLeague(
  id: string,
  update: UpdateDBPicksLeague,
  tx?: DBTransaction,
): Promise<DBPicksLeague | null> {
  const queryRows = tx
    ? await tx
        .update(picksLeagues)
        .set(update)
        .where(eq(picksLeagues.id, id))
        .returning()
    : await db
        .update(picksLeagues)
        .set(update)
        .where(eq(picksLeagues.id, id))
        .returning();
  if (!queryRows.length) {
    return null;
  }

  return queryRows[0];
}

export interface DBPicksLeagueWithMember extends DBPicksLeague {
  DBPicksLeagueWithMember: DBPicksLeagueMember;
}

export async function getDBPicksLeagueWithMember(
  leagueId: string,
  userId: string,
): Promise<DBPicksLeagueWithMember | null> {
  const queryRows = await db
    .select()
    .from(picksLeagues)
    .innerJoin(
      picksLeagueMembers,
      eq(picksLeagues.id, picksLeagueMembers.leagueId),
    )
    .where(
      and(eq(picksLeagues.id, leagueId), eq(picksLeagueMembers.userId, userId)),
    );
  if (!queryRows.length) {
    return null;
  }

  return {
    ...queryRows[0].picks_leagues,
    DBPicksLeagueWithMember: queryRows[0].picks_league_members,
  };
}

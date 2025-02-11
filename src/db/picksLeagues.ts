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
  inArray,
  isNull,
  sql,
} from "drizzle-orm";
import { PicksLeagueMemberRoles } from "@/models/picksLeagueMembers";
import { DBSportLeagueWeek } from "@/db/sportLeagueWeeks";
import { DBPicksLeagueMember } from "@/db/picksLeagueMembers";
import {
  getActiveDBPicksLeagueSeason,
  getNextDBPicksLeagueSeason,
  getPreviousDBPicksLeagueSeason,
} from "./picksLeagueSeasons";
import { getDBSportLeagueSeasonById } from "./sportLeagueSeason";

export interface DBPicksLeague {
  id: string;
  name: string;
  logoUrl: string | null;
  sportLeagueId: string;
  picksPerWeek: number;
  pickType: PicksLeaguePickTypes;
  visibility: PicksLeagueVisibilities;
  size: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDBPicksLeague {
  name: string;
  logoUrl: string | null;
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

export interface UserDBPicksLeagueDetails extends DBPicksLeagueDetails {
  sportLeagueSeasonName: string;
}

export async function getDBPicksLeagueDetailsForUser(
  userId: string,
  limit?: number,
): Promise<UserDBPicksLeagueDetails[]> {
  const queryRows = await db
    .select()
    .from(picksLeagueMembers)
    .innerJoin(picksLeagues, eq(picksLeagueMembers.leagueId, picksLeagues.id))
    .innerJoin(sportLeagues, eq(picksLeagues.sportLeagueId, sportLeagues.id))
    .where(eq(picksLeagueMembers.userId, userId));

  const picksLeagueDetails: UserDBPicksLeagueDetails[] = [];
  for (const row of queryRows) {
    let dbPicksLeagueSeason = await getActiveDBPicksLeagueSeason(
      row.picks_leagues.id,
    );
    if (!dbPicksLeagueSeason) {
      dbPicksLeagueSeason = await getNextDBPicksLeagueSeason(
        row.picks_leagues.id,
      );
    }
    if (!dbPicksLeagueSeason) {
      dbPicksLeagueSeason = await getPreviousDBPicksLeagueSeason(
        row.picks_leagues.id,
      );
    }
    if (!dbPicksLeagueSeason) {
      continue;
    }

    const sportLeagueSeason = await getDBSportLeagueSeasonById(
      dbPicksLeagueSeason.sportLeagueSeasonId,
    );
    if (!sportLeagueSeason) {
      continue;
    }

    picksLeagueDetails.push({
      ...row.picks_leagues,
      sportLeagueAbbreviation: row.sports_leagues.abbreviation,
      sportLeagueSeasonName: sportLeagueSeason.name,
    });
  }

  return picksLeagueDetails.slice(0, limit);
}

export interface filterDBPicksLeaguesParams {
  sportLeagueSeasonIds: string[];
  sportLeagueId?: string;
  pickType?: PicksLeaguePickTypes;
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
    inArray(
      picksLeagueSeasons.sportLeagueSeasonId,
      params.sportLeagueSeasonIds,
    ),
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
      eq(picksLeagues.id, picksLeagueSeasons.leagueId),
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
      eq(picksLeagues.id, picksLeagueSeasons.leagueId),
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
    .innerJoin(
      picksLeagueMembers,
      eq(picksLeagueMembers.leagueId, picksLeagues.id),
    )
    .innerJoin(sportLeagues, eq(picksLeagues.sportLeagueId, sportLeagues.id))
    .where(
      and(
        eq(picksLeagues.id, picksLeagueId),
        eq(picksLeagueMembers.userId, userId),
      ),
    );
  if (!queryRows.length) {
    return null;
  }

  return {
    ...queryRows[0].picksLeague,
    sportLeagueAbbreviation: queryRows[0].sportLeagueAbbreviation,
    role: queryRows[0].role ?? PicksLeagueMemberRoles.NONE,
  };
}

export interface DBPicksLeagueSettingDetails extends DBPicksLeague {
  startSportLeagueWeek: DBSportLeagueWeek;
  endSportLeagueWeek: DBSportLeagueWeek;
}

export async function getPickLeagueSettingsDetails(
  leagueId: string,
  seasonId: string,
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
      eq(picksLeagues.id, picksLeagueSeasons.leagueId),
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
    .where(
      and(eq(picksLeagues.id, leagueId), eq(picksLeagueSeasons.id, seasonId)),
    );

  return queryRows.length > 0
    ? {
        ...queryRows[0].picksLeague,
        startSportLeagueWeek: queryRows[0].startSportLeagueWeek,
        endSportLeagueWeek: queryRows[0].endSportLeagueWeek,
      }
    : null;
}

export interface UpdateDBPicksLeague {
  name?: string;
  logoUrl: string | null;
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
  member: DBPicksLeagueMember;
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
    member: queryRows[0].picks_league_members,
  };
}

export async function deleteDBPicksLeague(leagueId: string): Promise<void> {
  await db.delete(picksLeagues).where(eq(picksLeagues.id, leagueId));

  return;
}

export async function deleteDBPicksLeagues(
  leagueIds: string[],
  tx?: DBTransaction,
): Promise<void> {
  tx
    ? await tx.delete(picksLeagues).where(inArray(picksLeagues.id, leagueIds))
    : await db.delete(picksLeagues).where(inArray(picksLeagues.id, leagueIds));

  return;
}

export interface DBPicksLeagueWithMembers extends DBPicksLeague {
  members: DBPicksLeagueMember[];
}

export async function getUserDBPicksLeaguesWithMembers(
  userId: string,
): Promise<DBPicksLeagueWithMembers[]> {
  const otherMembersAlias = aliasedTable(
    picksLeagueMembers,
    "otherMembersAlias",
  );
  const queryRows = await db
    .select({
      league: getTableColumns(picksLeagues),
      member: getTableColumns(otherMembersAlias),
    })
    .from(picksLeagueMembers)
    .innerJoin(picksLeagues, eq(picksLeagueMembers.leagueId, picksLeagues.id))
    .innerJoin(
      otherMembersAlias,
      eq(otherMembersAlias.leagueId, picksLeagues.id),
    )
    .where(eq(picksLeagueMembers.userId, userId));

  const leaguesWithMembers: DBPicksLeagueWithMembers[] = [];
  queryRows.forEach((row) => {
    const indexOfLeague = leaguesWithMembers.findIndex(
      (league) => league.id === row.league.id,
    );
    if (indexOfLeague > -1) {
      leaguesWithMembers[indexOfLeague].members.push(row.member);
    } else {
      leaguesWithMembers.push({
        ...row.league,
        members: [row.member],
      });
    }
  });

  return leaguesWithMembers;
}

export async function getDBPicksLeaguesWithoutSportLeagueSeason(
  sportLeagueId: string,
  sportLeagueSeasonId: string,
  tx?: DBTransaction,
): Promise<DBPicksLeague[]> {
  const queryRows = tx
    ? await tx
        .select({
          ...getTableColumns(picksLeagues),
        })
        .from(picksLeagues)
        .leftJoin(
          picksLeagueSeasons,
          and(
            eq(picksLeagueSeasons.leagueId, picksLeagues.id),
            eq(picksLeagueSeasons.sportLeagueSeasonId, sportLeagueSeasonId),
          ),
        )
        .where(
          and(
            eq(picksLeagues.sportLeagueId, sportLeagueId),
            isNull(picksLeagueSeasons.id),
          ),
        )
    : await db
        .select({
          ...getTableColumns(picksLeagues),
        })
        .from(picksLeagues)
        .leftJoin(
          picksLeagueSeasons,
          and(
            eq(picksLeagueSeasons.leagueId, picksLeagues.id),
            eq(picksLeagueSeasons.sportLeagueSeasonId, sportLeagueSeasonId),
          ),
        )
        .where(
          and(
            eq(picksLeagues.sportLeagueId, sportLeagueId),
            isNull(picksLeagueSeasons.id),
          ),
        );

  return queryRows;
}

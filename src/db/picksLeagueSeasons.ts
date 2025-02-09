import { DBTransaction } from "@/db/transactions";
import {
  picksLeagueMembers,
  picksLeagueSeasons,
  picksLeagueStandings,
  sportLeagueWeeks,
} from "@/db/schema";
import { db } from "@/db/client";
import {
  aliasedTable,
  and,
  desc,
  eq,
  getTableColumns,
  gte,
  isNull,
  lte,
} from "drizzle-orm";
import { DBPicksLeagueMember } from "@/db/picksLeagueMembers";
import { DBSportLeagueWeek } from "./sportLeagueWeeks";

export interface CreateDBPicksLeagueSeason {
  leagueId: string;
  sportLeagueSeasonId: string;
  startSportLeagueWeekId: string;
  endSportLeagueWeekId: string;
}

export interface DBPicksLeagueSeason {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  leagueId: string;
  sportLeagueSeasonId: string;
  startSportLeagueWeekId: string;
  endSportLeagueWeekId: string;
}

export async function createDBPicksLeagueSeason(
  data: CreateDBPicksLeagueSeason,
  tx?: DBTransaction,
): Promise<DBPicksLeagueSeason | null> {
  const queryRows = tx
    ? await tx.insert(picksLeagueSeasons).values(data).returning()
    : await db.insert(picksLeagueSeasons).values(data).returning();
  if (!queryRows.length) {
    return null;
  }

  return queryRows[0];
}

export async function bulkCreateDBPicksLeagueSeasons(
  data: CreateDBPicksLeagueSeason[],
  tx?: DBTransaction,
): Promise<DBPicksLeagueSeason[]> {
  const queryRows = tx
    ? await tx.insert(picksLeagueSeasons).values(data).returning()
    : await db.insert(picksLeagueSeasons).values(data).returning();

  return queryRows;
}

export interface UpdateDBPicksLeagueSeason {
  leagueId?: string;
  sportLeagueSeasonId?: string;
  startSportLeagueWeekId?: string;
  endSportLeagueWeekId?: string;
}

export async function updateDBPicksLeagueSeason(
  id: string,
  update: UpdateDBPicksLeagueSeason,
  tx?: DBTransaction,
) {
  const queryRows = tx
    ? await tx
        .update(picksLeagueSeasons)
        .set(update)
        .where(eq(picksLeagueSeasons.id, id))
        .returning()
    : await db
        .update(picksLeagueSeasons)
        .set(update)
        .where(eq(picksLeagueSeasons.id, id))
        .returning();
  if (!queryRows.length) {
    return null;
  }

  return queryRows[0];
}

export async function getActiveDBPicksLeagueSeason(
  picksLeagueId: string,
  tx?: DBTransaction,
): Promise<DBPicksLeagueSeason | null> {
  const startWeekAlias = aliasedTable(sportLeagueWeeks, "startWeekAlias");
  const endWeekAlias = aliasedTable(sportLeagueWeeks, "endWeekAlias");
  const now = new Date();

  const queryRows = tx
    ? await tx
        .select({
          season: getTableColumns(picksLeagueSeasons),
        })
        .from(picksLeagueSeasons)
        .innerJoin(
          startWeekAlias,
          eq(startWeekAlias.id, picksLeagueSeasons.startSportLeagueWeekId),
        )
        .innerJoin(
          endWeekAlias,
          eq(endWeekAlias.id, picksLeagueSeasons.endSportLeagueWeekId),
        )
        .where(
          and(
            eq(picksLeagueSeasons.leagueId, picksLeagueId),
            lte(startWeekAlias.startTime, now),
            gte(endWeekAlias.endTime, now),
          ),
        )
    : await db
        .select({
          season: getTableColumns(picksLeagueSeasons),
        })
        .from(picksLeagueSeasons)
        .innerJoin(
          startWeekAlias,
          eq(startWeekAlias.id, picksLeagueSeasons.startSportLeagueWeekId),
        )
        .innerJoin(
          endWeekAlias,
          eq(endWeekAlias.id, picksLeagueSeasons.endSportLeagueWeekId),
        )
        .where(
          and(
            eq(picksLeagueSeasons.leagueId, picksLeagueId),
            lte(startWeekAlias.startTime, now),
            gte(endWeekAlias.endTime, now),
          ),
        );

  return queryRows.length > 0 ? queryRows[0].season : null;
}

export async function getActiveDBPicksLeagueSeasons(
  tx?: DBTransaction,
): Promise<DBPicksLeagueSeason[]> {
  const startWeekAlias = aliasedTable(sportLeagueWeeks, "startWeekAlias");
  const endWeekAlias = aliasedTable(sportLeagueWeeks, "endWeekAlias");
  const now = new Date();

  const queryRows = tx
    ? await tx
        .select({
          season: getTableColumns(picksLeagueSeasons),
        })
        .from(picksLeagueSeasons)
        .innerJoin(
          startWeekAlias,
          eq(startWeekAlias.id, picksLeagueSeasons.startSportLeagueWeekId),
        )
        .innerJoin(
          endWeekAlias,
          eq(endWeekAlias.id, picksLeagueSeasons.endSportLeagueWeekId),
        )
        .where(
          and(
            lte(startWeekAlias.startTime, now),
            gte(endWeekAlias.endTime, now),
          ),
        )
    : await db
        .select({
          season: getTableColumns(picksLeagueSeasons),
        })
        .from(picksLeagueSeasons)
        .innerJoin(
          startWeekAlias,
          eq(startWeekAlias.id, picksLeagueSeasons.startSportLeagueWeekId),
        )
        .innerJoin(
          endWeekAlias,
          eq(endWeekAlias.id, picksLeagueSeasons.endSportLeagueWeekId),
        )
        .where(
          and(
            lte(startWeekAlias.startTime, now),
            gte(endWeekAlias.endTime, now),
          ),
        );

  return queryRows.map((row) => row.season);
}

export interface DBPicksLeagueSeasonsAndMembersWithoutStandings {
  season: DBPicksLeagueSeason;
  member: DBPicksLeagueMember;
}

export async function getDBPicksLeagueSeasonsAndMembersWithoutStandings(
  tx?: DBTransaction,
): Promise<DBPicksLeagueSeasonsAndMembersWithoutStandings[]> {
  return tx
    ? await tx
        .select({
          season: getTableColumns(picksLeagueSeasons),
          member: getTableColumns(picksLeagueMembers),
        })
        .from(picksLeagueSeasons)
        .innerJoin(
          picksLeagueMembers,
          eq(picksLeagueMembers.leagueId, picksLeagueSeasons.leagueId),
        )
        .leftJoin(
          picksLeagueStandings,
          eq(picksLeagueStandings.seasonId, picksLeagueSeasons.id),
        )
        .where(isNull(picksLeagueStandings.id))
    : await db
        .select({
          season: getTableColumns(picksLeagueSeasons),
          member: getTableColumns(picksLeagueMembers),
        })
        .from(picksLeagueSeasons)
        .innerJoin(
          picksLeagueMembers,
          eq(picksLeagueMembers.leagueId, picksLeagueSeasons.leagueId),
        )
        .leftJoin(
          picksLeagueStandings,
          eq(picksLeagueStandings.seasonId, picksLeagueSeasons.id),
        );
}

export async function getNextDBPicksLeagueSeason(
  picksLeagueId: string,
): Promise<DBPicksLeagueSeason | null> {
  const now = new Date();
  const startWeekAlias = aliasedTable(sportLeagueWeeks, "startWeekAlias");

  const queryRows = await db
    .select({
      season: getTableColumns(picksLeagueSeasons),
    })
    .from(picksLeagueSeasons)
    .innerJoin(
      startWeekAlias,
      eq(startWeekAlias.id, picksLeagueSeasons.startSportLeagueWeekId),
    )
    .where(
      and(
        eq(picksLeagueSeasons.leagueId, picksLeagueId),
        gte(startWeekAlias.startTime, now),
      ),
    )
    .orderBy(startWeekAlias.startTime);
  return queryRows.length > 0 ? queryRows[0].season : null;
}

export async function getPreviousDBPicksLeagueSeason(
  picksLeagueId: string,
): Promise<DBPicksLeagueSeason | null> {
  const now = new Date();
  const endWeekAlias = aliasedTable(sportLeagueWeeks, "endWeekAlias");

  const queryRows = await db
    .select({
      season: getTableColumns(picksLeagueSeasons),
    })
    .from(picksLeagueSeasons)
    .innerJoin(
      endWeekAlias,
      eq(endWeekAlias.id, picksLeagueSeasons.endSportLeagueWeekId),
    )
    .where(
      and(
        eq(picksLeagueSeasons.leagueId, picksLeagueId),
        lte(endWeekAlias.endTime, now),
      ),
    )
    .orderBy(desc(endWeekAlias.startTime));
  return queryRows.length > 0 ? queryRows[0].season : null;
}

export interface DBPicksLeagueSeasonWithStartAndEndWeek
  extends DBPicksLeagueSeason {
  startweek: DBSportLeagueWeek;
  endweek: DBSportLeagueWeek;
}

export async function getLatestDBPicksLeagueSeason(
  picksLeagueId: string,
  tx?: DBTransaction,
): Promise<DBPicksLeagueSeasonWithStartAndEndWeek | null> {
  const startWeekAlias = aliasedTable(sportLeagueWeeks, "startWeekAlias");
  const endWeekAlias = aliasedTable(sportLeagueWeeks, "endWeekAlias");
  const queryRows = tx
    ? await tx
        .select({
          ...getTableColumns(picksLeagueSeasons),
          startweek: getTableColumns(startWeekAlias),
          endweek: getTableColumns(endWeekAlias),
        })
        .from(picksLeagueSeasons)
        .where(eq(picksLeagueSeasons.leagueId, picksLeagueId))
        .innerJoin(
          startWeekAlias,
          eq(startWeekAlias.id, picksLeagueSeasons.startSportLeagueWeekId),
        )
        .innerJoin(
          endWeekAlias,
          eq(endWeekAlias.id, picksLeagueSeasons.endSportLeagueWeekId),
        )
        .orderBy(desc(startWeekAlias.startTime))
        .limit(1)
    : await db
        .select({
          ...getTableColumns(picksLeagueSeasons),
          startweek: getTableColumns(startWeekAlias),
          endweek: getTableColumns(endWeekAlias),
        })
        .from(picksLeagueSeasons)
        .where(eq(picksLeagueSeasons.leagueId, picksLeagueId))
        .innerJoin(
          startWeekAlias,
          eq(startWeekAlias.id, picksLeagueSeasons.startSportLeagueWeekId),
        )
        .innerJoin(
          endWeekAlias,
          eq(endWeekAlias.id, picksLeagueSeasons.endSportLeagueWeekId),
        )
        .orderBy(desc(startWeekAlias.startTime))
        .limit(1);
  return queryRows.length > 0 ? queryRows[0] : null;
}

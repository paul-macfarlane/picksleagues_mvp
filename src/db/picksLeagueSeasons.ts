import { DBTransaction } from "@/db/transactions";
import {
  picksLeagueMembers,
  picksLeagueSeasons,
  picksLeagueStandings,
} from "@/db/schema";
import { db } from "@/db/client";
import { and, eq, getTableColumns, isNull } from "drizzle-orm";
import { DBPicksLeagueMember } from "@/db/picksLeagueMembers";

export interface CreateDBPicksLeagueSeason {
  leagueId: string;
  sportLeagueSeasonId: string;
  startSportLeagueWeekId: string;
  endSportLeagueWeekId: string;
  active: boolean;
}

export interface DBPicksLeagueSeason {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
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

export interface UpdateDBPicksLeagueSeason {
  active?: boolean;
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
  const queryRows = tx
    ? await tx
        .select()
        .from(picksLeagueSeasons)
        .where(
          and(
            eq(picksLeagueSeasons.leagueId, picksLeagueId),
            eq(picksLeagueSeasons.active, true),
          ),
        )
    : await db
        .select()
        .from(picksLeagueSeasons)
        .where(
          and(
            eq(picksLeagueSeasons.leagueId, picksLeagueId),
            eq(picksLeagueSeasons.active, true),
          ),
        );
  if (!queryRows.length) {
    return null;
  }

  return queryRows[0];
}

export async function getActiveDBPicksLeagueSeasons(
  tx?: DBTransaction,
): Promise<DBPicksLeagueSeason[]> {
  return tx
    ? await tx
        .select()
        .from(picksLeagueSeasons)
        .where(eq(picksLeagueSeasons.active, true))
    : db
        .select()
        .from(picksLeagueSeasons)
        .where(eq(picksLeagueSeasons.active, true));
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

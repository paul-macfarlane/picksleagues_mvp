import { db } from "@/db/client";
import { eq, getTableColumns, sql } from "drizzle-orm";
import {
  picksLeagueInvites,
  picksLeagueMembers,
  picksLeagues,
} from "@/db/schema";
import { DBPicksLeague } from "@/db/picksLeagues";
import { DBTransaction } from "@/db/transactions";

export interface DBPicksLeagueDetailsForInvite extends DBPicksLeague {
  memberCount: number;
  invite: DBPicksLeagueInvite;
}

export async function getDBPicksLeagueDetailsForInvite(
  inviteId: string,
): Promise<DBPicksLeagueDetailsForInvite | null> {
  const queryRows = await db
    .select({
      invites: getTableColumns(picksLeagueInvites),
      picksLeague: getTableColumns(picksLeagues),
      memberCount: sql<number>`cast
          (count(${picksLeagueMembers.userId}) as int)`,
    })
    .from(picksLeagues)
    .innerJoin(picksLeagueInvites, eq(picksLeagueInvites.id, inviteId))
    .leftJoin(
      picksLeagueMembers,
      eq(picksLeagueMembers.leagueId, picksLeagues.id),
    )
    .groupBy(picksLeagues.id);
  if (!queryRows.length) {
    return null;
  }

  return {
    ...queryRows[0].picksLeague,
    memberCount: queryRows[0].memberCount,
    invite: queryRows[0].invites,
  };
}

export interface CreateDBPicksLeagueInvite {
  leagueId: string;
  expiresAt: Date;
}

export interface DBPicksLeagueInvite {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  leagueId: string;
  acceptedByUserId: string | null;
  expiresAt: Date;
}

export async function createDBPicksLeagueInvite(
  data: CreateDBPicksLeagueInvite,
): Promise<DBPicksLeagueInvite | null> {
  const queryRes = await db
    .insert(picksLeagueInvites)
    .values({ ...data })
    .returning();
  if (!queryRes.length) {
    return null;
  }

  return queryRes[0];
}

export async function acceptDBPicksLeagueInvite(
  userId: string,
  leagueInviteId: string,
  tx?: DBTransaction,
): Promise<void> {
  if (tx) {
    await tx
      .update(picksLeagueInvites)
      .set({ acceptedByUserId: userId })
      .where(eq(picksLeagueInvites.id, leagueInviteId));
  } else {
    await db
      .update(picksLeagueInvites)
      .set({ acceptedByUserId: userId })
      .where(eq(picksLeagueInvites.id, leagueInviteId));
  }
}

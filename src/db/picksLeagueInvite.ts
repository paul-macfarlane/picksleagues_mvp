import { db } from "@/db/client";
import { eq, getTableColumns, sql, and, isNull, gt } from "drizzle-orm";
import {
  picksLeagueInvites,
  picksLeagueMembers,
  picksLeagues,
  sportLeagues,
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
    .innerJoin(
      picksLeagueInvites,
      eq(picksLeagueInvites.leagueId, picksLeagues.id),
    )
    .leftJoin(
      picksLeagueMembers,
      eq(picksLeagueMembers.leagueId, picksLeagues.id),
    )
    .where(eq(picksLeagueInvites.id, inviteId))
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
  userId?: string;
}

export interface DBPicksLeagueInvite {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  leagueId: string;
  acceptedByUserId: string | null;
  expiresAt: Date;
  userId: string | null;
}

export interface DBPicksLeaguePendingInvite extends DBPicksLeagueInvite {
  leagueName: string;
  sportLeagueAbbreviation: string;
  pickType: string;
  logoUrl: string | null;
}

export async function getDBPicksLeaguePendingInvitesForUser(
  userId: string,
): Promise<DBPicksLeaguePendingInvite[]> {
  const now = new Date();

  return db
    .select({
      id: picksLeagueInvites.id,
      createdAt: picksLeagueInvites.createdAt,
      updatedAt: picksLeagueInvites.updatedAt,
      leagueId: picksLeagueInvites.leagueId,
      acceptedByUserId: picksLeagueInvites.acceptedByUserId,
      expiresAt: picksLeagueInvites.expiresAt,
      userId: picksLeagueInvites.userId,
      leagueName: picksLeagues.name,
      sportLeagueAbbreviation: sportLeagues.abbreviation,
      pickType: picksLeagues.pickType,
      logoUrl: picksLeagues.logoUrl,
    })
    .from(picksLeagueInvites)
    .innerJoin(picksLeagues, eq(picksLeagueInvites.leagueId, picksLeagues.id))
    .innerJoin(sportLeagues, eq(picksLeagues.sportLeagueId, sportLeagues.id))
    .where(
      and(
        eq(picksLeagueInvites.userId, userId),
        isNull(picksLeagueInvites.acceptedByUserId),
        gt(picksLeagueInvites.expiresAt, now),
        eq(picksLeagueInvites.declined, false),
      ),
    );
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

export async function declineDBPicksLeagueInvite(
  leagueInviteId: string,
  tx?: DBTransaction,
): Promise<void> {
  if (tx) {
    await tx
      .update(picksLeagueInvites)
      .set({ declined: true })
      .where(eq(picksLeagueInvites.id, leagueInviteId));
  } else {
    await db
      .update(picksLeagueInvites)
      .set({ declined: true })
      .where(eq(picksLeagueInvites.id, leagueInviteId));
  }
}

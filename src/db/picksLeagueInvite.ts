import { db } from "@/db/client";
import {
  eq,
  getTableColumns,
  sql,
  and,
  isNull,
  gt,
  inArray,
} from "drizzle-orm";
import {
  picksLeagueInvites,
  picksLeagueMembers,
  picksLeagues,
  sportLeagues,
  users,
} from "@/db/schema";
import { DBPicksLeague } from "@/db/picksLeagues";
import { DBTransaction } from "@/db/transactions";
import { DBUser } from "@/db/users";
import { PicksLeagueMemberRoles } from "@/models/picksLeagueMembers";

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
  role: PicksLeagueMemberRoles;
}

export interface DBPicksLeagueInvite {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  leagueId: string;
  acceptedByUserId: string | null;
  expiresAt: Date;
  userId: string | null;
  role: PicksLeagueMemberRoles;
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
      ...getTableColumns(picksLeagueInvites),
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

export async function getOpenDBPicksLeagueInvitesForLeagueAndUser(
  leagueId: string,
  userId: string,
): Promise<DBPicksLeagueInvite[]> {
  const now = new Date();

  return db
    .select()
    .from(picksLeagueInvites)
    .where(
      and(
        eq(picksLeagueInvites.leagueId, leagueId),
        eq(picksLeagueInvites.userId, userId),
        isNull(picksLeagueInvites.acceptedByUserId),
        gt(picksLeagueInvites.expiresAt, now),
        eq(picksLeagueInvites.declined, false),
      ),
    );
}

export async function getOpenDBPicksLeagueInvitesForLeague(
  leagueId: string,
  tx?: DBTransaction,
): Promise<DBPicksLeagueInvite[]> {
  const now = new Date();

  return tx
    ? tx
        .select()
        .from(picksLeagueInvites)
        .where(
          and(
            eq(picksLeagueInvites.leagueId, leagueId),
            isNull(picksLeagueInvites.acceptedByUserId),
            gt(picksLeagueInvites.expiresAt, now),
            eq(picksLeagueInvites.declined, false),
          ),
        )
    : db
        .select()
        .from(picksLeagueInvites)
        .where(
          and(
            eq(picksLeagueInvites.leagueId, leagueId),
            isNull(picksLeagueInvites.acceptedByUserId),
            gt(picksLeagueInvites.expiresAt, now),
            eq(picksLeagueInvites.declined, false),
          ),
        );
}

export interface DBPicksLeagueInviteWithUser extends DBPicksLeagueInvite {
  user: DBUser;
}

export async function getOutstandingDBPicksLeagueInvitesWithUser(
  leagueId: string,
): Promise<DBPicksLeagueInviteWithUser[]> {
  const now = new Date();

  return db
    .select({
      ...getTableColumns(picksLeagueInvites),
      user: getTableColumns(users),
    })
    .from(picksLeagueInvites)
    .innerJoin(users, eq(users.id, picksLeagueInvites.userId))
    .where(
      and(
        eq(picksLeagueInvites.leagueId, leagueId),
        isNull(picksLeagueInvites.acceptedByUserId),
        gt(picksLeagueInvites.expiresAt, now),
        eq(picksLeagueInvites.declined, false),
      ),
    );
}

export async function getDBPicksLeagueInviteById(
  inviteId: string,
): Promise<DBPicksLeagueInvite | null> {
  const queryRows = await db
    .select()
    .from(picksLeagueInvites)
    .where(eq(picksLeagueInvites.id, inviteId));
  return queryRows.length > 0 ? queryRows[0] : null;
}

export interface UpdateDBPicksLeagueInvite {
  role: PicksLeagueMemberRoles;
}

export async function updateDBPicksLeagueInvite(
  id: string,
  params: UpdateDBPicksLeagueInvite,
  tx?: DBTransaction,
): Promise<DBPicksLeagueInvite | null> {
  const queryRes = tx
    ? await tx
        .update(picksLeagueInvites)
        .set(params)
        .where(eq(picksLeagueInvites.id, id))
        .returning()
    : await db
        .update(picksLeagueInvites)
        .set(params)
        .where(eq(picksLeagueInvites.id, id))
        .returning();

  return queryRes.length ? queryRes[0] : null;
}

export async function updateDBPicksLeagueInvitesExpiry(
  ids: string[],
  expiresAt: Date,
  tx?: DBTransaction,
): Promise<DBPicksLeagueInvite[]> {
  return tx
    ? tx
        .update(picksLeagueInvites)
        .set({ expiresAt })
        .where(inArray(picksLeagueInvites.id, ids))
        .returning()
    : await db
        .update(picksLeagueInvites)
        .set({ expiresAt })
        .where(inArray(picksLeagueInvites.id, ids))
        .returning();
}

export async function deleteDBPicksLeagueInvite(
  id: string,
  tx?: DBTransaction,
): Promise<void> {
  tx
    ? await tx.delete(picksLeagueInvites).where(eq(picksLeagueInvites.id, id))
    : await db.delete(picksLeagueInvites).where(eq(picksLeagueInvites.id, id));
}

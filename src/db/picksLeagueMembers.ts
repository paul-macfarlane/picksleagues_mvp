import { DBTransaction } from "@/db/transactions";
import { picksLeagueMembers, users } from "@/db/schema";
import { db } from "@/db/client";
import { and, count, eq } from "drizzle-orm";
import { DBUser } from "@/db/users";
import { PicksLeagueMemberRoles } from "@/models/picksLeagueMembers";

export interface CreateDBPicksLeagueMember {
  userId: string;
  leagueId: string;
  role: PicksLeagueMemberRoles;
}

export interface DBPicksLeagueMember {
  createdAt: Date;
  updatedAt: Date;
  leagueId: string;
  userId: string;
  role: PicksLeagueMemberRoles;
}

export async function createDBPicksLeagueMember(
  data: CreateDBPicksLeagueMember,
  tx?: DBTransaction,
): Promise<DBPicksLeagueMember | null> {
  const queryRows = tx
    ? await tx.insert(picksLeagueMembers).values(data).returning()
    : await db.insert(picksLeagueMembers).values(data).returning();
  if (!queryRows.length) {
    return null;
  }

  return queryRows[0];
}

export interface DBPicksLeagueMemberDetails extends DBUser {
  role: PicksLeagueMemberRoles;
}

export async function getDBPicksLeagueMemberDetails(
  leagueId: string,
): Promise<DBPicksLeagueMemberDetails[]> {
  const queryRows = await db
    .select()
    .from(picksLeagueMembers)
    .innerJoin(users, eq(users.id, picksLeagueMembers.userId))
    .where(eq(picksLeagueMembers.leagueId, leagueId));

  return queryRows.map((row) => ({
    ...row.users,
    role: row.picks_league_members.role,
  }));
}

export async function getDBPicksLeagueMember(
  leagueId: string,
  userId: string,
): Promise<DBPicksLeagueMember | null> {
  const queryRows = await db
    .select()
    .from(picksLeagueMembers)
    .where(
      and(
        eq(picksLeagueMembers.userId, userId),
        eq(picksLeagueMembers.leagueId, leagueId),
      ),
    );
  if (!queryRows.length) {
    return null;
  }

  return queryRows[0];
}

export interface UpdateDBPicksLeagueMember {
  userId: string;
  leagueId: string;
  role: PicksLeagueMemberRoles;
}

export async function updateDBPicksLeagueMember(
  update: UpdateDBPicksLeagueMember,
): Promise<DBPicksLeagueMember | null> {
  const queryRows = await db
    .update(picksLeagueMembers)
    .set({
      role: update.role,
    })
    .where(
      and(
        eq(picksLeagueMembers.userId, update.userId),
        eq(picksLeagueMembers.leagueId, update.leagueId),
      ),
    )
    .returning();
  return queryRows.length > 0 ? queryRows[0] : null;
}

export async function getPicksLeagueMemberCount(
  picksLeagueId: string,
): Promise<number> {
  const result = await db
    .select({ count: count() })
    .from(picksLeagueMembers)
    .where(eq(picksLeagueMembers.leagueId, picksLeagueId));
  return result.length > 0 ? result[0].count : 0;
}

export async function deleteDBPicksLeagueMember(
  userId: string,
  leagueId: string,
  tx?: DBTransaction,
): Promise<void> {
  if (tx) {
    await tx
      .delete(picksLeagueMembers)
      .where(
        and(
          eq(picksLeagueMembers.userId, userId),
          eq(picksLeagueMembers.leagueId, leagueId),
        ),
      );
  } else {
    await db
      .delete(picksLeagueMembers)
      .where(
        and(
          eq(picksLeagueMembers.userId, userId),
          eq(picksLeagueMembers.leagueId, leagueId),
        ),
      );
  }
}

export async function getDBPicksLeagueMembersWithRole(
  picksLeagueId: string,
  role: PicksLeagueMemberRoles,
): Promise<DBPicksLeagueMember[]> {
  return db
    .select()
    .from(picksLeagueMembers)
    .where(
      and(
        eq(picksLeagueMembers.leagueId, picksLeagueId),
        eq(picksLeagueMembers.role, role),
      ),
    );
}

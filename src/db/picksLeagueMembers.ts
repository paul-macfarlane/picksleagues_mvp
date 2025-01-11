import { DBTransaction } from "@/db/transactions";
import { picksLeagueMembers, users } from "@/db/schema";
import { db } from "@/db/client";
import { and, eq } from "drizzle-orm";
import { DBUser } from "@/db/users";
import { PicksLeagueMemberRoles } from "@/models/picksLeagueMembers";

export interface CreateDBPicksLeagueMember {
  userId: string;
  leagueId: string;
  role: string;
}

export interface DBPicksLeagueMember {
  createdAt: Date;
  updatedAt: Date;
  leagueId: string;
  userId: string;
  role: string;
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

interface DBPicksLeagueMemberDetails extends DBUser {
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
    role: row.picks_league_members.role as PicksLeagueMemberRoles,
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

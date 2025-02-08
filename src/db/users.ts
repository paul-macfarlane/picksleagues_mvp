import { db } from "./client";
import { picksLeagueMembers, users } from "./schema";
import { DBTransaction } from "@/db/transactions";
import { like, or, and, not, exists, eq } from "drizzle-orm";

export interface DBUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  username: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function getDBUserById(id: string): Promise<DBUser | null> {
  const queryRes = await db.select().from(users).where(eq(users.id, id));

  return queryRes.length ? queryRes[0] : null;
}

interface UpdateDBUser {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  username?: string | null;
  name?: string | null;
}

export async function updateDBUser(
  id: string,
  params: UpdateDBUser,
  tx?: DBTransaction,
): Promise<DBUser | null> {
  const queryRes = tx
    ? await tx.update(users).set(params).where(eq(users.id, id)).returning()
    : await db.update(users).set(params).where(eq(users.id, id)).returning();

  return queryRes.length ? queryRes[0] : null;
}

export async function dbUsernameAvailable(username: string): Promise<boolean> {
  return !(await db.select().from(users).where(eq(users.username, username)))
    .length;
}

export async function searchUsersNotInLeague(
  picksLeagueId: string,
  query: string,
  limit: number,
): Promise<DBUser[]> {
  return db
    .select()
    .from(users)
    .where(
      and(
        or(
          like(users.username, `%${query}%`),
          like(users.firstName, `%${query}%`),
          like(users.lastName, `%${query}%`),
        ),
        // Exclude users who are already members of the league
        not(
          exists(
            db
              .select()
              .from(picksLeagueMembers)
              .where(
                and(
                  eq(picksLeagueMembers.leagueId, picksLeagueId),
                  eq(picksLeagueMembers.userId, users.id),
                ),
              ),
          ),
        ),
      ),
    )
    .limit(limit);
}

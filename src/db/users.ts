import { eq } from "drizzle-orm";
import { db } from "./client";
import { users } from "./schema";

export const MAX_USERNAME_LENGTH = 20;

interface DBUser {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  username: string | null;
}

export async function getDBUserById(id: string): Promise<DBUser | null> {
  const queryRes = await db.select().from(users).where(eq(users.id, id));
  if (!queryRes.length) {
    return null;
  }

  return queryRes[0];
}

interface UpdateDBUser {
  username?: string;
}

export async function updateDBUser(
  id: string,
  update: UpdateDBUser
): Promise<void> {
  await db
    .update(users)
    .set({ ...update })
    .where(eq(users.id, id));
}

export async function dbUserExistsByUsername(
  username: string
): Promise<boolean | void> {
  return !!(
    await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
  ).length;
}

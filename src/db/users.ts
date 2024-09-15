import { eq } from "drizzle-orm";
import { db } from "./client";
import { users } from "./schema";

interface DBUser {
  id: string;
  name: string | null;
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
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  username?: string | null;
}

export async function updateDBUser(
  id: string,
  params: UpdateDBUser
): Promise<DBUser | null> {
  const queryRes = await db
    .update(users)
    .set(params)
    .where(eq(users.id, id))
    .returning();

  return queryRes.length ? queryRes[0] : null;
}

export async function dbUsernameAvailable(username: string): Promise<boolean> {
  return !(await db.select().from(users).where(eq(users.username, username)))
    .length;
}

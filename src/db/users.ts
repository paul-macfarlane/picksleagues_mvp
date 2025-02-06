import { eq } from "drizzle-orm";
import { db } from "./client";
import { users } from "./schema";
import { DBTransaction } from "@/db/transactions";

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

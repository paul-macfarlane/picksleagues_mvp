import { DBTransaction } from "@/db/transactions";
import { sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";

export async function deleteUserDBSessions(
  userId: string,
  tx?: DBTransaction,
): Promise<void> {
  if (tx) {
    await tx.delete(sessions).where(eq(sessions.userId, userId));
  } else {
    await db.delete(sessions).where(eq(sessions.userId, userId));
  }
}

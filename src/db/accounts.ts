import { DBTransaction } from "@/db/transactions";
import { accounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";

export async function deleteUserDBAccount(
  userId: string,
  tx?: DBTransaction,
): Promise<void> {
  if (tx) {
    await tx.delete(accounts).where(eq(accounts.userId, userId));
  } else {
    await db.delete(accounts).where(eq(accounts.userId, userId));
  }
}

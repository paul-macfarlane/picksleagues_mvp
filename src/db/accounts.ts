import { DBTransaction } from "@/db/transactions";
import { accounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import type { AdapterAccountType } from "next-auth/adapters";

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

export interface DBAccount {
  userId: string;
  type: AdapterAccountType;
  provider: string;
  providerAccountId: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDBAccountInput {
  userId: string;
  type: AdapterAccountType;
  provider: string;
  providerAccountId: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
}

export async function createDBAccount(
  input: CreateDBAccountInput,
  tx?: DBTransaction,
): Promise<DBAccount> {
  const result = tx
    ? await tx.insert(accounts).values(input).returning()
    : await db.insert(accounts).values(input).returning();

  return result[0];
}

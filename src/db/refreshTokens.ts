import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "./client";
import { refreshTokens } from "./schema";
import { DBTransaction } from "./transactions";

export interface DBRefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDBRefreshToken {
  userId: string;
  token: string;
  expiresAt: Date;
}

export async function createDBRefreshToken(
  params: CreateDBRefreshToken,
  tx?: DBTransaction,
): Promise<DBRefreshToken> {
  const queryRows = tx
    ? await tx.insert(refreshTokens).values(params).returning()
    : await db.insert(refreshTokens).values(params).returning();

  return queryRows[0];
}

export async function getActiveDBRefreshTokenByToken(
  token: string,
  tx?: DBTransaction,
): Promise<DBRefreshToken | null> {
  const queryRows = tx
    ? await tx
        .select()
        .from(refreshTokens)
        .where(
          and(
            eq(refreshTokens.token, token),
            isNull(refreshTokens.revokedAt),
            gt(refreshTokens.expiresAt, new Date()),
          ),
        )
    : await db
        .select()
        .from(refreshTokens)
        .where(
          and(
            eq(refreshTokens.token, token),
            isNull(refreshTokens.revokedAt),
            gt(refreshTokens.expiresAt, new Date()),
          ),
        );
  if (!queryRows.length) {
    return null;
  }

  return queryRows[0];
}

export async function revokeDBRefreshToken(
  token: string,
  tx?: DBTransaction,
): Promise<void> {
  const queryRows = tx
    ? await tx
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(eq(refreshTokens.token, token))
    : await db
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(eq(refreshTokens.token, token));
  if (!queryRows) {
    throw new Error("Failed to revoke token");
  }
}

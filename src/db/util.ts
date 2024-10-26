import { ResultSet } from "@libsql/client";
import { db } from "./client";
import { SQLiteTransaction } from "drizzle-orm/sqlite-core";
import { ExtractTablesWithRelations } from "drizzle-orm";

export type Transaction = SQLiteTransaction<
  "async",
  ResultSet,
  Record<string, never>,
  ExtractTablesWithRelations<Record<string, never>>
>;

export async function withTransaction<T>(
  callback: (tx: Transaction) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    try {
      const result = await callback(tx);

      return result;
    } catch (error) {
      tx.rollback();

      throw error; // Re-throw the error so it's handled by the caller
    }
  });
}

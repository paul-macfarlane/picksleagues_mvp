import { ResultSet } from "@libsql/client";
import { db } from "./client";
import { SQLiteTransaction } from "drizzle-orm/sqlite-core";
import { ExtractTablesWithRelations } from "drizzle-orm";

export type DBTransaction = SQLiteTransaction<
  "async",
  ResultSet,
  Record<string, never>,
  ExtractTablesWithRelations<Record<string, never>>
>;

export async function withDBTransaction<T>(
  callback: (tx: DBTransaction) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    return await callback(tx);
  });
}

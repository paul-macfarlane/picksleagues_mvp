import { oddsProviders, sportGameOdds } from "@/db/schema";
import { Transaction } from "@/db/util";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db/client";

export interface DBOddsProvider {
  id: string;
  name: string;
  espnId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function getDBOddsProviderByEspnId(
  espnId: string,
  tx?: Transaction,
): Promise<DBOddsProvider | null> {
  if (tx) {
    const queryRows = await tx
      .select()
      .from(oddsProviders)
      .where(eq(oddsProviders.espnId, espnId));
    return queryRows[0] || null;
  } else {
    const queryRows = await db
      .select()
      .from(oddsProviders)
      .where(eq(oddsProviders.espnId, espnId));
    return queryRows[0] || null;
  }
}

export interface UpsertDBOddsProvider {
  name: string;
  espnId: string | null;
}

export async function upsertDBOddsProviders(
  upserts: UpsertDBOddsProvider[],
  tx?: Transaction,
) {
  if (tx) {
    return tx
      .insert(oddsProviders)
      .values(upserts)
      .onConflictDoUpdate({
        target: [oddsProviders.espnId],
        set: {
          name: sql`excluded.name`,
        },
      })
      .returning();
  } else {
    return db
      .insert(oddsProviders)
      .values(upserts)
      .onConflictDoUpdate({
        target: [oddsProviders.espnId],
        set: {
          name: sql`excluded.name`,
        },
      })
      .returning();
  }
}

export interface UpsertDBSportGameOdds {
  gameId: string;
  providerId: string;
  favoriteTeamId: string;
  underDogTeamId: string;
  spread: number;
  overUnder: number;
}

export async function upsertDBSportGameOdds(
  upserts: UpsertDBSportGameOdds[],
  tx?: Transaction,
) {
  if (tx) {
    return tx
      .insert(sportGameOdds)
      .values(upserts)
      .onConflictDoUpdate({
        target: [sportGameOdds.gameId, sportGameOdds.providerId],
        set: {
          favoriteTeamId: sql`excluded.favorite_team_id`,
          underDogTeamId: sql`excluded.under_dog_team_id`,
          spread: sql`excluded.spread`,
          overUnder: sql`excluded.over_under`,
        },
      })
      .returning();
  } else {
    return db
      .insert(sportGameOdds)
      .values(upserts)
      .onConflictDoUpdate({
        target: [sportGameOdds.gameId, sportGameOdds.providerId],
        set: {
          favoriteTeamId: sql`excluded.favorite_team_id`,
          underDogTeamId: sql`excluded.under_dog_team_id`,
          spread: sql`excluded.spread`,
          overUnder: sql`excluded.over_under`,
        },
      })
      .returning();
  }
}

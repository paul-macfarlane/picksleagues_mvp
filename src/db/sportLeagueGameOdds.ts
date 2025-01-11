import { oddsProviders, sportLeagueGameOdds } from "@/db/schema";
import { DBTransaction } from "@/db/transactions";
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
  tx?: DBTransaction,
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
  tx?: DBTransaction,
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

export interface UpsertDBSportLeagueGameOdds {
  gameId: string;
  providerId: string;
  favoriteTeamId: string;
  underDogTeamId: string;
  spread: number;
  overUnder: number;
}

export async function upsertDBSportLeagueGameOdds(
  upserts: UpsertDBSportLeagueGameOdds[],
  tx?: DBTransaction,
) {
  if (tx) {
    return tx
      .insert(sportLeagueGameOdds)
      .values(upserts)
      .onConflictDoUpdate({
        target: [sportLeagueGameOdds.gameId, sportLeagueGameOdds.providerId],
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
      .insert(sportLeagueGameOdds)
      .values(upserts)
      .onConflictDoUpdate({
        target: [sportLeagueGameOdds.gameId, sportLeagueGameOdds.providerId],
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

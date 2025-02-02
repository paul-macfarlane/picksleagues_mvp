import { sportLeagueTeams } from "@/db/schema";
import { db } from "@/db/client";
import { eq, sql } from "drizzle-orm";
import { DBTransaction } from "@/db/transactions";

export interface DBSportLeagueTeam {
  id: string;
  leagueId: string;
  name: string;
  location: string;
  abbreviation: string;
  logoUrl: string | null;
  espnId: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getDBSportLeagueTeamByEspnId(
  espnId: string,
  tx?: DBTransaction,
): Promise<DBSportLeagueTeam | null> {
  if (tx) {
    const queryRows = await tx
      .select()
      .from(sportLeagueTeams)
      .where(eq(sportLeagueTeams.espnId, espnId));
    return queryRows[0] || null;
  } else {
    const queryRows = await db
      .select()
      .from(sportLeagueTeams)
      .where(eq(sportLeagueTeams.espnId, espnId));
    return queryRows[0] || null;
  }
}

export interface UpsertDBSportLeagueTeam {
  leagueId: string;
  name: string;
  location: string;
  abbreviation: string;
  logoUrl: string | null;
  espnId: string;
}

export async function upsertDBSportLeagueTeams(
  upserts: UpsertDBSportLeagueTeam[],
  tx: DBTransaction,
): Promise<DBSportLeagueTeam[]> {
  if (tx) {
    return tx
      .insert(sportLeagueTeams)
      .values(upserts)
      .onConflictDoUpdate({
        target: [sportLeagueTeams.leagueId, sportLeagueTeams.espnId],
        set: {
          name: sql`excluded.name`,
          location: sql`excluded.location`,
          abbreviation: sql`excluded.abbreviation`,
          logoUrl: sql`excluded.logo_url`,
        },
      })
      .returning();
  } else {
    return db
      .insert(sportLeagueTeams)
      .values(upserts)
      .onConflictDoUpdate({
        target: [sportLeagueTeams.leagueId, sportLeagueTeams.espnId],
        set: {
          name: sql`excluded.name`,
          location: sql`excluded.location`,
          abbreviation: sql`excluded.abbreviation`,
          logoUrl: sql`excluded.logo_url`,
        },
      })
      .returning();
  }
}

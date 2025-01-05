import { sportTeams } from "@/db/schema";
import { db } from "@/db/client";
import { eq } from "drizzle-orm";
import { Transaction } from "@/db/util";

interface DBSportTeam {
  id: string;
  sportLeagueId: string;
  name: string;
  location: string;
  abbreviation: string;
  logoUrl: string | null;
  espnId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function getDBSportTeamByEspnId(
  espnId: string,
  tx?: Transaction,
): Promise<DBSportTeam | null> {
  if (tx) {
    const queryRows = await tx
      .select()
      .from(sportTeams)
      .where(eq(sportTeams.espnId, espnId));
    return queryRows[0] || null;
  } else {
    const queryRows = await db
      .select()
      .from(sportTeams)
      .where(eq(sportTeams.espnId, espnId));
    return queryRows[0] || null;
  }
}

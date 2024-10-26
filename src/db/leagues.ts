import { LeagueVisibilities, PickTypes } from "@/models/leagues";
import { db } from "./client";
import { leagueMembers, leagues, leagueSeasons, sports } from "./schema";
import { Transaction as DBTransaction } from "./util";
import { eq } from "drizzle-orm";

interface DBLeague {
  id: string;
  name: string;
  logoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  sportId: string;
  picksPerWeek: number;
  pickType: string;
  leagueVisibility: string;
}

interface CreateDBLeague {
  name: string;
  logoUrl?: string;
  sportId: string;
  picksPerWeek: number;
  pickType: PickTypes;
  leagueVisibility: LeagueVisibilities;
}

export async function createDBLeague(
  data: CreateDBLeague,
  tx?: DBTransaction,
): Promise<DBLeague | null> {
  const queryRows = tx
    ? await tx.insert(leagues).values(data).returning()
    : await db.insert(leagues).values(data).returning();
  if (!queryRows.length) {
    return null;
  }

  return queryRows[0];
}

interface CreateDBLeagueSeason {
  leagueId: string;
  sportSeasonId: string;
  startSportWeekId: string;
  endSportWeekId: string;
  active: boolean;
}

interface DBLeagueSeason {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  leagueId: string;
  sportSeasonId: string;
  startSportWeekId: string;
  endSportWeekId: string;
}

export async function createDBLeagueSeason(
  data: CreateDBLeagueSeason,
  tx?: DBTransaction,
): Promise<DBLeagueSeason | null> {
  const queryRows = tx
    ? await tx.insert(leagueSeasons).values(data).returning()
    : await db.insert(leagueSeasons).values(data).returning();
  if (!queryRows.length) {
    return null;
  }

  return queryRows[0];
}

interface CreateDBLeagueMember {
  userId: string;
  leagueId: string;
  role: string;
}

interface DBLeagueMember {
  createdAt: Date;
  updatedAt: Date;
  leagueId: string;
  userId: string;
  role: string;
}

export async function createDBLeagueMember(
  data: CreateDBLeagueMember,
  tx?: DBTransaction,
): Promise<DBLeagueMember | null> {
  const queryRows = tx
    ? await tx.insert(leagueMembers).values(data).returning()
    : await db.insert(leagueMembers).values(data).returning();
  if (!queryRows.length) {
    return null;
  }

  return queryRows[0];
}

interface DBLeagueDetails extends DBLeague {
  sportName: string;
}

export async function getDBLeagueDetailsForUser(
  userId: string,
): Promise<DBLeagueDetails[]> {
  const queryRows = await db
    .select()
    .from(leagueMembers)
    .where(eq(leagueMembers.userId, userId))
    .innerJoin(leagues, eq(leagueMembers.leagueId, leagues.id))
    .innerJoin(sports, eq(leagues.sportId, sports.id));

  return queryRows.map((row) => ({
    ...row.leagues,
    sportName: row.sports.name,
  }));
}

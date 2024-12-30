import { getNFLESPNTeams } from "@/integrations/espn/teams";
import { DBSport } from "@/db/sports";
import { scriptDB } from "@/db/scriptClient";
import { sports, sportTeams } from "@/db/schema";
import { eq } from "drizzle-orm";

async function getDBSportByName(name: string): Promise<DBSport | null> {
  const queryRows = await scriptDB
    .select()
    .from(sports)
    .where(eq(sports.name, name));
  if (!queryRows.length) {
    return null;
  }

  return queryRows[0];
}

interface UpsertSportTeam {
  sportId: string;
  name: string;
  espnId?: string;
  location: string;
  abbreviation: string;
  logoUrl?: string;
}

async function upsertDBSportTeams(teams: UpsertSportTeam[]): Promise<void> {
  await scriptDB.insert(sportTeams).values(teams).onConflictDoNothing();
}

async function seedNFLTeams() {
  const dbSport = await getDBSportByName("NFL");
  if (!dbSport) {
    throw new Error("Sport with name 'NFL' not found.");
  }
  const teams = await getNFLESPNTeams();

  await upsertDBSportTeams(
    teams.map((team) => ({
      sportId: dbSport.id,
      name: team.name,
      espnId: team.id,
      location: team.location,
      abbreviation: team.abbreviation,
      logoUrl: team.logos.length ? team.logos[0].href : undefined,
    })),
  );
}

function main() {
  void seedNFLTeams();
}

main();

import { withDBTransaction } from "@/db/transactions";
import { getAllDBSportLeagues } from "@/db/sportLeagues";
import {
  DBSportLeagueTeam,
  UpsertDBSportLeagueTeam,
  upsertDBSportLeagueTeams,
} from "@/db/sportLeagueTeams";
import {
  getActiveDBSportLeagueSeason,
  getNextDBSportLeagueSeason,
} from "@/db/sportLeagueSeason";
import { getESPNSportLeagueTeams } from "@/integrations/espn/sportLeagueTeams";

export async function upsertSportLeagueTeamsFromESPN(): Promise<
  DBSportLeagueTeam[]
> {
  let dbSportLeagueTeams: DBSportLeagueTeam[] = [];
  await withDBTransaction(async (tx) => {
    const dbSportLeagues = await getAllDBSportLeagues(tx);

    const dbSportLeagueTeamUpserts: UpsertDBSportLeagueTeam[] = [];
    for (const dbSportLeague of dbSportLeagues) {
      let dbSeason = await getActiveDBSportLeagueSeason(dbSportLeague.id, tx);
      if (!dbSeason) {
        dbSeason = await getNextDBSportLeagueSeason(dbSportLeague.id, tx);
      }
      if (!dbSeason) {
        console.warn(
          `Could not find active or next season for sport league ${dbSportLeague.id}`,
        );
        continue;
      }

      const espnSportLeagueTeams = await getESPNSportLeagueTeams(
        dbSportLeague.espnSportSlug,
        dbSportLeague.espnSlug,
        dbSeason.name,
      );
      dbSportLeagueTeamUpserts.push(
        ...espnSportLeagueTeams.map((espnSportTeam) => ({
          leagueId: dbSportLeague.id,
          name: espnSportTeam.displayName,
          espnId: espnSportTeam.id,
          location: espnSportTeam.location,
          abbreviation: espnSportTeam.abbreviation,
          logoUrl: espnSportTeam.logos.length
            ? espnSportTeam.logos[0].href
            : null,
        })),
      );
    }

    if (dbSportLeagueTeamUpserts.length > 0) {
      dbSportLeagueTeams = await upsertDBSportLeagueTeams(
        dbSportLeagueTeamUpserts,
        tx,
      );
    }
  });

  return dbSportLeagueTeams;
}

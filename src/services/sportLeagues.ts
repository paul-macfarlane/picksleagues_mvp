import { getESPNSportLeagues } from "@/integrations/espn/sportLeagues";
import { ESPNLeagueSlug, ESPNSportSlug } from "@/integrations/espn/shared";
import {
  DBSportLeague,
  DBSportLeagueWithSeasonDetail,
  getActiveDBSportLeagueSeasonDetailsWithActiveWeeks,
  getNextDBSportLeagueSeasonDetailsWithWeeks,
  upsertDBSportLeagues,
} from "@/db/sportLeagues";

export async function upsertSportLeaguesFromESPN(): Promise<DBSportLeague[]> {
  const espnSportLeagues = await getESPNSportLeagues(ESPNSportSlug.FOOTBALL);

  const espnSportLeagueIdToSlugMap = new Map<string, ESPNLeagueSlug>();
  for (const espnSportLeague of espnSportLeagues) {
    espnSportLeagueIdToSlugMap.set(espnSportLeague.id, espnSportLeague.slug);
  }

  return upsertDBSportLeagues(
    espnSportLeagues.map((sportLeague) => ({
      name: sportLeague.name,
      abbreviation: sportLeague.abbreviation,
      logoUrl: sportLeague.logos.length ? sportLeague.logos[0].href : null,
      espnId: sportLeague.id,
      espnSlug: sportLeague.slug,
      espnSportSlug: ESPNSportSlug.FOOTBALL,
    })),
  );
}

export async function getActiveOrNextSportLeagueSeasonsDetails(): Promise<
  DBSportLeagueWithSeasonDetail[]
> {
  const activeDBSportLeagueDetails =
    await getActiveDBSportLeagueSeasonDetailsWithActiveWeeks();
  const nextDBSportLeagueDetails =
    await getNextDBSportLeagueSeasonDetailsWithWeeks();

  const details = activeDBSportLeagueDetails;
  for (const nextDBSportLeagueDetail of nextDBSportLeagueDetails) {
    const indexOfLeague = details.findIndex(
      (leagueDetail) => leagueDetail.id === nextDBSportLeagueDetail.id,
    );
    if (indexOfLeague === -1) {
      details.push(nextDBSportLeagueDetail);
    }
  }

  return details;
}

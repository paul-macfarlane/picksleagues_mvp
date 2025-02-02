import { getESPNSportLeagues } from "@/integrations/espn/sportLeagues";
import { ESPNLeagueSlug, ESPNSportSlug } from "@/integrations/espn/shared";
import { DBSportLeague, upsertDBSportLeagues } from "@/db/sportLeagues";

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

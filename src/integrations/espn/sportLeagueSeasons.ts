import axios from "axios";
import {
  ESPNLeagueSlug,
  ESPNListResponse,
  ESPNRef,
  ESPNSportSlug,
} from "@/integrations/espn/shared";

interface Week {
  $ref: string;
  number: number;
  startDate: string;
  endDate: string;
  text: string;
  rankings: ESPNRef;
  events: ESPNRef;
  talentpicks: ESPNRef;
}

interface Type {
  $ref: string;
  id: string;
  type: number;
  name: string;
  abbreviation: string;
  year: number;
  startDate: string;
  endDate: string;
  hasGroups: boolean;
  hasStandings: boolean;
  hasLegs: boolean;
  groups: ESPNRef;
  week?: Week;
  weeks: ESPNRef;
  corrections: ESPNRef;
  leaders: ESPNRef;
  slug: string;
}

interface TypeItem extends Type {
  week?: Week;
}

interface Types {
  $ref: string;
  count: number;
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  items: TypeItem[];
}

interface Season {
  $ref: string;
  year: number;
  startDate: string;
  endDate: string;
  displayName: string;
  type: Type;
  types: Types;
  rankings: ESPNRef;
  coaches: ESPNRef;
  athletes: ESPNRef;
  futures: ESPNRef;
}

export async function getNextAndActiveESPNSportLeagueSeasons(
  sportSlug: ESPNSportSlug,
  leagueSlug: ESPNLeagueSlug,
): Promise<Season[]> {
  const now = new Date();
  const seasonRefs = await getESPNSportLeagueSeasonsRefs(sportSlug, leagueSlug);
  if (!seasonRefs.length) {
    return [];
  }

  const latestSeason = await axios.get<Season>(
    seasonRefs[0].$ref.replace("http://", "https://"),
  );
  if (
    new Date(latestSeason.data.startDate) < now &&
    new Date(latestSeason.data.endDate) > now
  ) {
    return [latestSeason.data];
  }

  // If the first fetched season is not active (the future season)
  // the following season retrieved should be because they come in reverse chronological order
  const secondLatestSeason = await axios.get<Season>(
    seasonRefs[1].$ref.replace("http://", "https://"),
  );
  if (new Date(secondLatestSeason.data.endDate) < now) {
    // if the second-latest season already passed only return the latest one
    return [latestSeason.data];
  }

  return [latestSeason.data, secondLatestSeason.data];
}

async function getESPNSportLeagueSeasonsRefs(
  sportSlug: ESPNSportSlug,
  leagueSlug: ESPNLeagueSlug,
): Promise<ESPNRef[]> {
  const response = await axios.get<ESPNListResponse>(
    `https://sports.core.api.espn.com/v2/sports/${sportSlug}/leagues/${leagueSlug}/seasons?lang=en&region=us`,
  );

  return response.data.items;
}

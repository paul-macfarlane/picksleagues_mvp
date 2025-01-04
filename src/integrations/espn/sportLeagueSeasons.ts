import axios from "axios";
import {
  ESPNLeagueSlug,
  ESPNListResponse,
  ESPNRef,
  ESPNSportSlug,
} from "@/integrations/espn/types";

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

export async function getActiveESPNSportLeagueSeason(
  sportSlug: ESPNSportSlug,
  leagueSlug: ESPNLeagueSlug,
): Promise<Season | null> {
  const seasonRefs = await getESPNSportLeagueSeasonsRefs(sportSlug, leagueSlug);
  if (!seasonRefs.length) {
    return null;
  }

  const response = await axios.get<Season>(
    seasonRefs[0].$ref.replace("http://", "https://"),
  );

  return response.data;
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

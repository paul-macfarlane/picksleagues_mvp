import {
  ESPNLink,
  ESPNLogo,
  ESPNRef,
  ESPNSportSlug,
} from "@/integrations/espn/types";
import axios from "axios";

interface League {
  $ref: string;
  id: string;
  guid: string;
  uid: string;
  name: string;
  displayName: string;
  abbreviation: string;
  shortName: string;
  midsizeName: string;
  slug: string;
  isTournament: boolean;
  season: Season;
  seasons: ESPNRef;
  franchises: ESPNRef;
  teams: ESPNRef;
  group: ESPNRef;
  groups: ESPNRef;
  events: ESPNRef;
  notes: ESPNRef;
  rankings: ESPNRef;
  awards: ESPNRef;
  links: ESPNLink[];
  logos: ESPNLogo[];
  athletes: ESPNRef;
  freeAgents: ESPNRef;
  calendar: ESPNRef;
  transactions: ESPNRef;
  talentPicks: ESPNRef;
  leaders: ESPNRef;
  gender: string;
}

interface Season {
  $ref: string;
  year: number;
  startDate: string;
  endDate: string;
  displayName: string;
  type: SeasonType;
  types: SeasonTypes;
  rankings: ESPNRef;
  awards: ESPNRef;
  futures: ESPNRef;
  logos: ESPNLogo[];
  athletes: ESPNRef;
  freeAgents: ESPNRef;
  calendar: ESPNRef;
  transactions: ESPNRef;
  talentPicks: ESPNRef;
  leaders: ESPNRef;
  gender: string;
}

interface SeasonType {
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
  weeks: ESPNRef;
  leaders: ESPNRef;
  slug: string;
}

interface SeasonTypes {
  $ref: string;
  count: number;
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  items: SeasonType[];
}

async function getSportLeague(
  sportSlug: ESPNSportSlug,
  leagueSlug: string,
): Promise<League> {
  const response = await axios.get<League>(
    `https://sports.core.api.espn.com/v2/sports/${sportSlug}/leagues/${leagueSlug}?lang=en&region=us`,
  );

  return response.data;
}

// todo "college-football" seems to timeout when all the teams are fetched, because it is a lot of teams
const LEAGUE_SLUGS = ["nfl"];

export async function getESPNSportLeagues(
  sportSlug: ESPNSportSlug,
): Promise<League[]> {
  const leagues = [];

  // there is also a paginated endpoint at https://sports.core.api.espn.com/v2/sports/{{sport}}/leagues/{{league}}?lang={{lang}}&region={{region}}
  // but right now only 2 leagues are supported so it's simpler to hardcode the names
  for (const leagueSlug of LEAGUE_SLUGS) {
    const sportLeague = await getSportLeague(sportSlug, leagueSlug);
    leagues.push(sportLeague);
  }

  return leagues;
}

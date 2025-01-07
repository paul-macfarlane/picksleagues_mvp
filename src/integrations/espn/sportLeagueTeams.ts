import axios from "axios";
import {
  ESPNLeagueSlug,
  ESPNSportSlug,
  ESPNListResponse,
  ESPNRef,
  ESPNLogo,
  ESPNLink,
} from "@/integrations/espn/shared";

interface Team {
  $ref?: string;
  id: string;
  guid: string;
  uid: string;
  alternateIds?: {
    sdr: string;
  };
  slug: string;
  location: string;
  nickname: string;
  abbreviation: string;
  displayName: string;
  shortDisplayName: string;
  color: string;
  alternateColor: string;
  isActive: boolean;
  isAllStar: boolean;
  logos: ESPNLogo[];
  record?: ESPNRef;
  oddsRecords?: ESPNRef;
  athletes?: ESPNRef;
  venue?: Venue;
  groups?: ESPNRef;
  ranks?: ESPNRef;
  statistics?: ESPNRef;
  leaders?: ESPNRef;
  links: ESPNLink[];
  injuries?: ESPNRef;
  notes?: ESPNRef;
  againstTheSpreadRecords?: ESPNRef;
  franchise?: ESPNRef;
  depthCharts?: ESPNRef;
  projection?: ESPNRef;
  events?: ESPNRef;
  transactions?: ESPNRef;
  coaches?: ESPNRef;
}

interface Venue {
  id: string;
  fullName: string;
  address: {
    city: string;
    state: string;
    zipCode: string;
  };
  grass: boolean;
  indoor: boolean;
  images?: ESPNLogo[];
}

async function getTeamsForLeague(
  sport: ESPNSportSlug,
  league: ESPNLeagueSlug,
  seasonDisplayName: string,
): Promise<Team[]> {
  let teamsResponse = await axios.get<ESPNListResponse>(
    `https://sports.core.api.espn.com/v2/sports/${sport}/leagues/${league}/seasons/${seasonDisplayName}/teams?lang=en&region=us&page=${1}`,
  );

  let teamRefs = teamsResponse.data.items.map((item) => item.$ref);
  while (teamsResponse.data.pageIndex < teamsResponse.data.pageCount) {
    teamsResponse = await axios.get<ESPNListResponse>(
      `https://sports.core.api.espn.com/v2/sports/${sport}/leagues/${league}/seasons/${seasonDisplayName}/teams?lang=en&region=us&page=${teamsResponse.data.pageIndex + 1}`,
    );

    teamRefs = [
      ...teamRefs,
      ...teamsResponse.data.items.map((item) => item.$ref),
    ];
  }

  const teams: Team[] = [];
  for (let i = 0; i < teamRefs.length; i++) {
    const teamResponse = await axios.get<Team>(
      teamRefs[i].replace("http://", "https://"),
    );
    teams.push(teamResponse.data);
  }

  return teams;
}

interface GetESPNTeamParam {
  sportSlug: ESPNSportSlug;
  leagueSlug: ESPNLeagueSlug;
  seasonDisplayName: string;
}

export async function getESPNSportLeagueTeams(
  params: GetESPNTeamParam[],
): Promise<Team[]> {
  let teams: Team[] = [];
  for (let i = 0; i < params.length; i++) {
    const sportTeams = await getTeamsForLeague(
      params[i].sportSlug,
      params[i].leagueSlug,
      params[i].seasonDisplayName,
    );
    teams = [...teams, ...sportTeams];
  }

  return teams;
}

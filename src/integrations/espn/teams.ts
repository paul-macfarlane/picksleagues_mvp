import axios from "axios";

interface ESPNTeamListResponse {
  count: number;
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  items: {
    $ref: string;
  }[];
}

interface ESPNTeam {
  $ref?: string;
  id: string;
  guid: string;
  uid: string;
  alternateIds?: {
    sdr: string;
  };
  slug: string;
  location: string;
  name: string;
  nickname: string;
  abbreviation: string;
  displayName: string;
  shortDisplayName: string;
  color: string;
  alternateColor: string;
  isActive: boolean;
  isAllStar: boolean;
  logos: ESPNLogo[];
  record?: {
    $ref: string;
  };
  oddsRecords?: {
    $ref: string;
  };
  athletes?: {
    $ref: string;
  };
  venue?: ESPNVenue;
  groups?: {
    $ref: string;
  };
  ranks?: {
    $ref: string;
  };
  statistics?: {
    $ref: string;
  };
  leaders?: {
    $ref: string;
  };
  links: ESPNLink[];
  injuries?: {
    $ref: string;
  };
  notes?: {
    $ref: string;
  };
  againstTheSpreadRecords?: {
    $ref: string;
  };
  franchise?: {
    $ref: string;
  };
  depthCharts?: {
    $ref: string;
  };
  projection?: {
    $ref: string;
  };
  events?: {
    $ref: string;
  };
  transactions?: {
    $ref: string;
  };
  coaches?: {
    $ref: string;
  };
}

interface ESPNLogo {
  href: string;
  width: number;
  height: number;
  alt: string;
  rel: string[];
  lastUpdated: string;
}

interface ESPNVenue {
  id: string;
  fullName: string;
  address: {
    city: string;
    state: string;
    zipCode: string;
  };
  grass: boolean;
  indoor: boolean;
  images?: {
    href: string;
    width: number;
    height: number;
    alt: string;
    rel: string[];
  }[];
}

interface ESPNLink {
  language: string;
  rel: string[];
  href: string;
  text: string;
  shortText: string;
  isExternal: boolean;
  isPremium: boolean;
}

export async function getNFLESPNTeams(): Promise<ESPNTeam[]> {
  let year = new Date().getFullYear();
  let teamsResponse = await axios.get<ESPNTeamListResponse>(
    `http://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/${year}/teams?lang=en&region=us&page=${1}`,
  );

  let teamRefs = teamsResponse.data.items.map((item) => item.$ref);
  while (teamsResponse.data.pageIndex < teamsResponse.data.pageCount) {
    teamsResponse = await axios.get<ESPNTeamListResponse>(
      `http://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/${year}/teams?lang=en&region=us&page=${teamsResponse.data.pageIndex + 1}`,
    );

    teamRefs = [
      ...teamRefs,
      ...teamsResponse.data.items.map((item) => item.$ref),
    ];
  }

  const teams: ESPNTeam[] = [];
  for (let i = 0; i < teamRefs.length; i++) {
    const teamResponse = await axios.get<ESPNTeam>(teamRefs[i]);
    teams.push(teamResponse.data);
  }

  return teams;
}

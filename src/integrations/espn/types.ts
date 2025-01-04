export enum ESPNSportSlug {
  FOOTBALL = "football",
}

export enum ESPNLeagueSlug {
  NFL = "nfl",
  COLLEGE_FOOTBALL = "college-football",
}

export interface ESPNListResponse {
  count: number;
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  items: ESPNRef[];
}

export interface ESPNRef {
  $ref: string;
}

export interface ESPNLogo {
  href: string;
  width: number;
  height: number;
  alt: string;
  rel: string[];
  lastUpdated: string;
}

export interface ESPNLink {
  language: string;
  rel: string[];
  href: string;
  text: string;
  shortText: string;
  isExternal: boolean;
  isPremium: boolean;
}

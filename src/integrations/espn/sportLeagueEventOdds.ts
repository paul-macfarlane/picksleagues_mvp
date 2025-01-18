import axios from "axios";

interface OddsData {
  $ref: string;
  provider: Provider;
  details: string;
  spread: number;
  overOdds: number;
  underOdds: number;
  awayTeamOdds: TeamOdds;
  homeTeamOdds: TeamOdds;
  links: OddsLink[];
}

interface Provider {
  $ref: string;
  id: string;
  name: string;
  priority: number;
}

interface TeamOdds {
  favorite: boolean;
  underdog: boolean;
  moneyLine: number;
  spreadOdds: number;
  open: OddsDetail;
  close: OddsDetail;
  current: OddsDetail;
  team: Team;
}

interface OddsDetail {
  pointSpread: OddsValue;
  spread: OddsValueWithMetrics;
  moneyLine: OddsValueWithMetrics;
}

interface OddsValue {
  alternateDisplayValue: string;
  american: string;
}

interface OddsValueWithMetrics extends OddsValue {
  value: number;
  displayValue: string;
  decimal: number;
  fraction: string;
}

interface Team {
  $ref: string;
}

interface OddsLink {
  language: string;
  rel: string[];
  href: string;
  text: string;
  shortText: string;
  isExternal: boolean;
  isPremium: boolean;
}

interface OddsListResponse {
  count: number;
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  items: OddsData[];
}

export async function getESPNEventOddsFromRefUrl(
  refUrl: string,
): Promise<OddsData[]> {
  const oddsRes = await axios.get<OddsListResponse>(refUrl);

  return oddsRes.data.items;
}

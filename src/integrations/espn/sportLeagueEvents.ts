import { ESPNRef } from "@/integrations/espn/shared";
import { getAllRefUrlsFromESPNListUrl } from "@/integrations/espn/lists";
import axios from "axios";

interface Event {
  $ref: string;
  id: string;
  uid: string;
  date: string;
  name: string;
  shortName: string;
  season: ESPNRef;
  seasonType: ESPNRef;
  week: ESPNRef;
  timeValid: boolean;
  competitions: Competition[];
}

interface Competition {
  $ref: string;
  id: string;
  guid: string;
  uid: string;
  date: string;
  attendance: number;
  type: CompetitionType;
  timeValid: boolean;
  dateValid: boolean;
  neutralSite: boolean;
  divisionCompetition: boolean;
  conferenceCompetition: boolean;
  previewAvailable: boolean;
  recapAvailable: boolean;
  boxscoreAvailable: boolean;
  lineupAvailable: boolean;
  gamecastAvailable: boolean;
  playByPlayAvailable: boolean;
  conversationAvailable: boolean;
  commentaryAvailable: boolean;
  pickcenterAvailable: boolean;
  summaryAvailable: boolean;
  liveAvailable: boolean;
  ticketsAvailable: boolean;
  shotChartAvailable: boolean;
  timeoutsAvailable: boolean;
  possessionArrowAvailable: boolean;
  onWatchESPN: boolean;
  recent: boolean;
  bracketAvailable: boolean;
  wallclockAvailable: boolean;
  gameSource: Source;
  boxscoreSource: Source;
  playByPlaySource: Source;
  linescoreSource: Source;
  statsSource: Source;
  venue: Venue;
  competitors: Competitor[];
  notes: any[]; // Define if needed
  situation: ESPNRef;
  status: ESPNRef;
  odds: ESPNRef;
  broadcasts: ESPNRef;
  officials: ESPNRef;
  details: ESPNRef;
  leaders: ESPNRef;
  links: Link[];
}

interface CompetitionType {
  id: string;
  text: string;
  abbreviation: string;
  slug: string;
  type: string;
}

interface Source {
  id: string;
  description: string;
  state: string;
}

interface Venue {
  $ref: string;
  id: string;
  fullName: string;
  address: Address;
  grass: boolean;
  indoor: boolean;
  images: Image[];
}

interface Address {
  city: string;
  state: string;
  zipCode: string;
}

interface Image {
  href: string;
  width: number;
  height: number;
  alt: string;
  rel: string[];
}

interface Competitor {
  $ref: string;
  id: string;
  uid: string;
  type: string;
  order: number;
  homeAway: string;
  winner: boolean;
  team: ESPNRef;
  score: ESPNRef;
  linescores: ESPNRef;
  roster: ESPNRef;
  statistics: ESPNRef;
  leaders: ESPNRef;
  record: ESPNRef;
}

interface Link {
  language: string;
  rel: string[];
  href: string;
}

export async function getESPNEventsFromRefUrl(
  refUrl: string,
): Promise<Event[]> {
  const events: Event[] = [];
  const espnEventRefs = await getAllRefUrlsFromESPNListUrl(refUrl);
  for (const espnEventRef of espnEventRefs) {
    const eventRes = await axios.get<Event>(espnEventRef);
    events.push(eventRes.data);
  }

  return events;
}

interface Score {
  $ref: string;
  value: number;
  displayValue: string;
  winner: boolean;
  source: {
    id: string;
    description: string;
  };
}

export async function getESPNEventScoreFromRefUrl(
  refUrl: string,
): Promise<Score> {
  const scoreRes = await axios.get<Score>(refUrl);

  return scoreRes.data;
}

interface Status {
  $ref: string;
  clock: number;
  displayClock: string;
  period: number;
  type: {
    id: string;
    name: string;
    state: string;
    completed: boolean;
    description: string;
    detail: string;
    shortDetail: string;
  };
}

export async function getESPNEventStatusFromRefUrl(
  refUrl: string,
): Promise<Status> {
  const statusRes = await axios.get<Status>(refUrl);

  return statusRes.data;
}

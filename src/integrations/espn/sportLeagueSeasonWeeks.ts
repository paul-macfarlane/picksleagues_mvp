import {
  ESPNLeagueSlug,
  ESPNListResponse,
  ESPNRef,
  ESPNSportSlug,
} from "@/integrations/espn/types";
import axios from "axios";

export enum ESPNSeasonType {
  REGULAR_SEASON = 2,
  POST_SEASON = 3,
}

async function getESPNSportLeagueSeasonWeekRefs(
  sportSlug: ESPNSportSlug,
  leagueSlug: ESPNLeagueSlug,
  seasonDisplayName: string,
  seasonType: ESPNSeasonType,
): Promise<ESPNRef[]> {
  const response = await axios.get<ESPNListResponse>(
    `https://sports.core.api.espn.com/v2/sports/${sportSlug}/leagues/${leagueSlug}/seasons/${seasonDisplayName}/types/${seasonType}/weeks?lang=en&region=us`,
  );

  return response.data.items;
}

interface Week {
  $ref: string;
  number: number;
  startDate: string;
  endDate: string;
  text: string;
  rankings: ESPNRef;
  events: ESPNRef;
}

export async function getESPNSportLeagueSeasonWeeks(
  sportSlug: ESPNSportSlug,
  leagueSlug: ESPNLeagueSlug,
  seasonDisplayName: string,
  seasonType: ESPNSeasonType,
): Promise<Week[]> {
  const weekRefs = await getESPNSportLeagueSeasonWeekRefs(
    sportSlug,
    leagueSlug,
    seasonDisplayName,
    seasonType,
  );

  const weeks: Week[] = [];
  for (const weekRef of weekRefs) {
    const response = await axios.get<Week>(
      weekRef.$ref.replace("http://", "https://"),
    );
    weeks.push(response.data);
  }

  return weeks;
}

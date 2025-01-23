import { DBPicksLeagueSettingDetails } from "@/db/picksLeagues";

export function canEditPicksLeagueSeasonSettings(
  picksLeague: DBPicksLeagueSettingDetails,
): boolean {
  const now = new Date();

  return (
    picksLeague.startSportLeagueWeek.startTime >= now ||
    picksLeague.endSportLeagueWeek.endTime <= now
  );
}

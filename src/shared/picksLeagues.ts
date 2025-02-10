import { DBPicksLeagueSettingDetails } from "@/db/picksLeagues";

export function canEditPicksLeagueSeasonSettings(
  picksLeague: DBPicksLeagueSettingDetails,
): boolean {
  const now = new Date();

  // if season is previous season (startTime < now && endTime < now), then cannot edit
  // if season is current season (startTime >= now && endTime <= now), then cannot edit
  // if season is future season (startTime > now && endTime > now), then can edit

  return (
    picksLeague.startSportLeagueWeek.startTime > now &&
    picksLeague.endSportLeagueWeek.endTime > now
  );
}

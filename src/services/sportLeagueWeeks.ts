import {
  DBSportLeagueWeek,
  getDBSportLeagueWeeksForPicksLeagueSeason,
} from "@/db/sportLeagueWeeks";

export interface PrevAndNextDBWeek {
  previousWeek: DBSportLeagueWeek | null;
  nextWeek: DBSportLeagueWeek | null;
}

export async function getPrevAndNextDBWeekForPicksLeague(
  picksLeagueId: string,
  sportsLeagueWeekId: string,
): Promise<PrevAndNextDBWeek> {
  const dbSportWeeks =
    await getDBSportLeagueWeeksForPicksLeagueSeason(picksLeagueId);
  dbSportWeeks.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  let previousWeek: DBSportLeagueWeek | null = null;
  let nextWeek: DBSportLeagueWeek | null = null;
  const indexOfSelectedWeek = dbSportWeeks.findIndex(
    (week) => week.id === sportsLeagueWeekId,
  );
  if (indexOfSelectedWeek > 0) {
    previousWeek = dbSportWeeks[indexOfSelectedWeek - 1];
  }
  if (
    indexOfSelectedWeek > -1 &&
    indexOfSelectedWeek < dbSportWeeks.length - 1
  ) {
    nextWeek = dbSportWeeks[indexOfSelectedWeek + 1];
  }

  return {
    previousWeek,
    nextWeek,
  };
}

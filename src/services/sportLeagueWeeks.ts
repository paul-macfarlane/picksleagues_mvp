import {
  DBSportLeagueWeek,
  getDBSportLeagueWeeksForPicksLeagueSeason,
  UpsertDBSportLeagueWeek,
  upsertDBSportLeagueWeeks,
} from "@/db/sportLeagueWeeks";
import { withDBTransaction } from "@/db/transactions";
import { getAllDBSportLeagues } from "@/db/sportLeagues";
import {
  DBSportLeagueSeason,
  getActiveDBSportLeagueSeason,
  getNextDBSportLeagueSeason,
} from "@/db/sportLeagueSeason";
import {
  ESPNSeasonType,
  getESPNSportLeagueSeasonWeeks,
} from "@/integrations/espn/sportLeagueWeeks";
import { SportLeagueWeekTypes } from "@/models/sportLeagueWeeks";
import { DateTime } from "luxon";

export interface PrevAndNextDBWeek {
  previousWeek: DBSportLeagueWeek | null;
  nextWeek: DBSportLeagueWeek | null;
}

export async function getPrevAndNextDBWeekForPicksLeagueSeason(
  picksLeagueSeasonId: string,
  sportsLeagueWeekId: string,
): Promise<PrevAndNextDBWeek> {
  const dbSportWeeks =
    await getDBSportLeagueWeeksForPicksLeagueSeason(picksLeagueSeasonId);
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

export async function upsertSportLeagueWeeksFromESPN(): Promise<
  DBSportLeagueWeek[]
> {
  let dbSportLeagueWeeks: DBSportLeagueWeek[] = [];
  await withDBTransaction(async (tx) => {
    const dbSportLeagues = await getAllDBSportLeagues(tx);

    const dbSportLeagueTeamUpserts: UpsertDBSportLeagueWeek[] = [];
    for (const dbSportLeague of dbSportLeagues) {
      const dbSeasons: DBSportLeagueSeason[] = [];
      const activeDBSeason = await getActiveDBSportLeagueSeason(
        dbSportLeague.id,
        tx,
      );
      if (activeDBSeason) {
        dbSeasons.push(activeDBSeason);
      }
      const nextDBSeason = await getNextDBSportLeagueSeason(
        dbSportLeague.id,
        tx,
      );
      if (nextDBSeason) {
        dbSeasons.push(nextDBSeason);
      }

      for (const dbSeason of dbSeasons) {
        const regularSeasonWeekUpserts = (
          await getESPNSportLeagueSeasonWeeks(
            dbSportLeague.espnSportSlug,
            dbSportLeague.espnSlug,
            dbSeason.name,
            ESPNSeasonType.REGULAR_SEASON,
          )
        ).map((week) => ({
          seasonId: dbSeason.id,
          name: week.text,
          startTime: new Date(week.startDate),
          endTime: new Date(week.endDate),
          espnEventsRef: week.events.$ref,
          type: SportLeagueWeekTypes.REGULAR_SEASON,
          pickLockTime:
            findFirstSundayAt1PMET(
              new Date(week.startDate),
              new Date(new Date(week.endDate)),
            ) ?? new Date(week.startDate),
        }));

        dbSportLeagueTeamUpserts.push(...regularSeasonWeekUpserts);

        const postSeasonWeekUpserts = (
          await getESPNSportLeagueSeasonWeeks(
            dbSportLeague.espnSportSlug,
            dbSportLeague.espnSlug,
            dbSeason.name,
            ESPNSeasonType.POST_SEASON,
          )
        )
          .filter(
            (week) =>
              week.text.toLowerCase() !== "pro bowl" &&
              // have to filter out weeks with duplicate names between regular and post because ESPN's API has a bug where sometimes regular season weeks also show in the post season
              regularSeasonWeekUpserts.findIndex(
                (regWeek) => regWeek.name === week.text,
              ) === -1,
          )
          .map((week) => ({
            seasonId: dbSeason.id,
            name: week.text,
            startTime: new Date(week.startDate),
            endTime: new Date(week.endDate),
            espnEventsRef: week.events.$ref,
            type: SportLeagueWeekTypes.PLAYOFFS,
            pickLockTime: new Date(week.endDate),
          }));

        dbSportLeagueTeamUpserts.push(...postSeasonWeekUpserts);
      }
    }

    if (dbSportLeagueTeamUpserts.length > 0) {
      console.log("dbSportLeagueTeamUpserts", dbSportLeagueTeamUpserts);
      // somehow by the time the weeks get here they get fucked up
      // its actually a bug with espn
      dbSportLeagueWeeks = await upsertDBSportLeagueWeeks(
        dbSportLeagueTeamUpserts,
        tx,
      );
    }
  });

  return dbSportLeagueWeeks;
}

function findFirstSundayAt1PMET(startDate: Date, endDate: Date): Date | null {
  const start = DateTime.fromJSDate(startDate, { zone: "utc" });
  const end = DateTime.fromJSDate(endDate, { zone: "utc" });

  let current = start.setZone("America/New_York");
  if (current.weekday !== 7) {
    current = current.plus({ days: 7 - current.weekday });
  }

  current = current.set({ hour: 13, minute: 0, second: 0, millisecond: 0 });
  if (current.toUTC() >= start && current.toUTC() <= end) {
    return current.toJSDate();
  }

  return null;
}

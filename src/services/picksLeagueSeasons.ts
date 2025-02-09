import { getDBPicksLeaguesWithoutSportLeagueSeason } from "@/db/picksLeagues";
import {
  CreateDBPicksLeagueSeason,
  getLatestDBPicksLeagueSeason,
  bulkCreateDBPicksLeagueSeasons,
} from "@/db/picksLeagueSeasons";
import { getAllDBSportLeagues } from "@/db/sportLeagues";
import { getLatestDBSportLeagueSeason } from "@/db/sportLeagueSeason";
import { getDBSportLeagueWeeksForSportLeagueSeason } from "@/db/sportLeagueWeeks";
import { withDBTransaction } from "@/db/transactions";

export async function createPicksLeagueSeasonsWhereLatestSeasonMissing() {
  await withDBTransaction(async (tx) => {
    const createPicksLeagueSeasons: CreateDBPicksLeagueSeason[] = [];

    const dbSportLeagues = await getAllDBSportLeagues(tx);
    console.log(`retrieved ${dbSportLeagues.length} sport leagues`);

    for (const dbSportLeague of dbSportLeagues) {
      const latestDBSeasonForSportLeague = await getLatestDBSportLeagueSeason(
        dbSportLeague.id,
        tx,
      );
      if (!latestDBSeasonForSportLeague) {
        console.warn(`sport league with id ${dbSportLeague.id} has no seasons`);
        continue;
      }
      console.log(
        `retrieved latest season ${latestDBSeasonForSportLeague.id} for sport league ${dbSportLeague.id}`,
      );

      const dbLatestSeasonWeeks =
        await getDBSportLeagueWeeksForSportLeagueSeason(
          latestDBSeasonForSportLeague.id,
          tx,
        );
      if (!dbLatestSeasonWeeks.length) {
        console.warn(
          `sport league season with id ${latestDBSeasonForSportLeague.id} has no weeks`,
        );
        continue;
      }
      console.log(
        `retrieved ${dbLatestSeasonWeeks.length} weeks for season ${latestDBSeasonForSportLeague.id}`,
      );

      const dbPicksLeaguesWithoutLatestSeason =
        await getDBPicksLeaguesWithoutSportLeagueSeason(
          dbSportLeague.id,
          latestDBSeasonForSportLeague.id,
          tx,
        );
      console.log(
        `retrieved ${dbPicksLeaguesWithoutLatestSeason.length} picks leagues without latest season for sport league ${dbSportLeague.id}`,
      );

      for (const dbPicksLeagueWithoutLatestSeason of dbPicksLeaguesWithoutLatestSeason) {
        const latestPicksLeagueSeason = await getLatestDBPicksLeagueSeason(
          dbPicksLeagueWithoutLatestSeason.id,
          tx,
        );
        if (!latestPicksLeagueSeason) {
          console.warn(
            `picks league with id ${dbPicksLeagueWithoutLatestSeason.id} has no seasons`,
          );
          continue;
        }
        console.log(
          `retrieved latest picks league season ${latestPicksLeagueSeason.id} for picks league ${dbPicksLeagueWithoutLatestSeason.id}`,
        );

        const newStartWeekId =
          dbLatestSeasonWeeks.find(
            (latestWeek) =>
              latestWeek.name === latestPicksLeagueSeason.startweek.name,
          )?.id ?? dbLatestSeasonWeeks[0].id;
        console.log(
          `retrieved new start week id ${newStartWeekId} for picks league season ${latestPicksLeagueSeason.id}`,
        );

        const newEndWeekId =
          dbLatestSeasonWeeks.find(
            (latestWeek) =>
              latestWeek.name === latestPicksLeagueSeason.endweek.name,
          )?.id ?? dbLatestSeasonWeeks[dbLatestSeasonWeeks.length - 1].id;
        console.log(
          `retrieved new end week id ${newEndWeekId} for picks league season ${latestPicksLeagueSeason.id}`,
        );

        createPicksLeagueSeasons.push({
          leagueId: dbPicksLeagueWithoutLatestSeason.id,
          sportLeagueSeasonId: latestDBSeasonForSportLeague.id,
          startSportLeagueWeekId: newStartWeekId,
          endSportLeagueWeekId: newEndWeekId,
        });
      }
    }

    if (createPicksLeagueSeasons.length > 0) {
      const newPicksLeagueSeasons = await bulkCreateDBPicksLeagueSeasons(
        createPicksLeagueSeasons,
        tx,
      );
      console.log(
        `created ${newPicksLeagueSeasons.length} picks league seasons`,
      );
    }
  });
}

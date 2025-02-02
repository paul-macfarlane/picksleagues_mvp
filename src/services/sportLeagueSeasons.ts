import { withDBTransaction } from "@/db/transactions";
import { getAllDBSportLeagues } from "@/db/sportLeagues";
import {
  DBSportLeagueSeason,
  UpsertDBSportLeagueSeason,
  upsertDBSportLeagueSeasons,
} from "@/db/sportLeagueSeason";
import { getNextAndActiveESPNSportLeagueSeasons } from "@/integrations/espn/sportLeagueSeasons";

export async function upsertSportLeagueSeasonsFromESPN() {
  let dbSportLeagueSeasons: DBSportLeagueSeason[] = [];
  await withDBTransaction(async (tx) => {
    const dbSportLeagues = await getAllDBSportLeagues(tx);

    const dbSportLeagueSeasonUpserts: UpsertDBSportLeagueSeason[] = [];
    for (const dbSportLeague of dbSportLeagues) {
      const espnSportLeagueSeasons =
        await getNextAndActiveESPNSportLeagueSeasons(
          dbSportLeague.espnSportSlug,
          dbSportLeague.espnSlug,
        );
      if (!espnSportLeagueSeasons.length) {
        console.warn(
          `No seasons found for sport league with id ${dbSportLeague.id}`,
        );
        continue;
      }

      dbSportLeagueSeasonUpserts.push(
        ...espnSportLeagueSeasons.map((sportSeason) => ({
          leagueId: dbSportLeague.id,
          name: sportSeason.displayName,
          startTime: new Date(sportSeason.startDate),
          endTime: new Date(sportSeason.endDate),
        })),
      );
    }

    if (dbSportLeagueSeasonUpserts.length) {
      dbSportLeagueSeasons = await upsertDBSportLeagueSeasons(
        dbSportLeagueSeasonUpserts,
        tx,
      );
    }
  });

  return dbSportLeagueSeasons;
}

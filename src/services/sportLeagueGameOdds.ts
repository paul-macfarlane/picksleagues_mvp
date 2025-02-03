import {
  DBOddsProvider,
  DBSportLeagueGameOdds,
  getDBOddsProviderByEspnId,
  upsertDBOddsProviders,
  upsertDBSportLeagueGameOdds,
  UpsertDBSportLeagueGameOdds,
} from "@/db/sportLeagueGameOdds";
import { withDBTransaction } from "@/db/transactions";
import { getActiveDBSportLeagueWeeks } from "@/db/sportLeagueWeeks";
import { getDBSportLeagueGamesForWeek } from "@/db/sportLeagueGames";
import { getESPNEventOddsFromRefUrl } from "@/integrations/espn/sportLeagueEventOdds";

export async function upsertSportLeagueGameOddsFromESPN(): Promise<
  DBSportLeagueGameOdds[]
> {
  let dbSportLeagueGameOdds: DBSportLeagueGameOdds[] = [];
  await withDBTransaction(async (tx) => {
    const dbSportWeeks = await getActiveDBSportLeagueWeeks(tx);
    if (!dbSportWeeks.length) {
      console.warn("No active sport weeks found.");
      return;
    }

    const oddsUpserts: UpsertDBSportLeagueGameOdds[] = [];
    for (const dbSportWeek of dbSportWeeks) {
      const dbSportLeagueGames = await getDBSportLeagueGamesForWeek(
        dbSportWeek.id,
        tx,
      );
      for (const dbSportLeagueGame of dbSportLeagueGames) {
        const now = new Date();
        if (dbSportLeagueGame.startTime < now) {
          console.log(
            `skipping odds update for game that already started with id ${dbSportLeagueGame.id}`,
          );
          continue;
        }

        const oddsList = await getESPNEventOddsFromRefUrl(
          dbSportLeagueGame.espnOddsRef,
        );
        for (const oddsData of oddsList) {
          let dbOddsProvider = await getOddsProviderByEspnIdCached(
            oddsData.provider.id,
          );
          if (!dbOddsProvider) {
            dbOddsProvider = (
              await upsertDBOddsProviders(
                [
                  {
                    name: oddsData.provider.name,
                    espnId: oddsData.provider.id,
                  },
                ],
                tx,
              )
            )[0];
          }

          const favoriteDBTeamId = oddsData.awayTeamOdds.favorite
            ? dbSportLeagueGame.awayTeamId
            : dbSportLeagueGame.homeTeamId;
          const underDogDBTeamId = oddsData.awayTeamOdds.favorite
            ? dbSportLeagueGame.homeTeamId
            : dbSportLeagueGame.awayTeamId;
          oddsUpserts.push({
            gameId: dbSportLeagueGame.id,
            providerId: dbOddsProvider.id,
            favoriteTeamId: favoriteDBTeamId,
            underDogTeamId: underDogDBTeamId,
            spread: Math.abs(oddsData.spread),
          });
        }
      }
    }

    if (oddsUpserts.length > 0) {
      dbSportLeagueGameOdds = await upsertDBSportLeagueGameOdds(
        oddsUpserts,
        tx,
      );
    }
  });

  return dbSportLeagueGameOdds;
}

let oddsProviderCache: Map<string, DBOddsProvider> = new Map();
let lastRefreshedOddsProviderCache: Date = new Date(0);

async function getOddsProviderByEspnIdCached(
  espnId: string,
): Promise<DBOddsProvider | null> {
  if (
    new Date().getTime() - lastRefreshedOddsProviderCache.getTime() >
    1000 * 60
  ) {
    oddsProviderCache = new Map();
    lastRefreshedOddsProviderCache = new Date();
  }

  if (oddsProviderCache.has(espnId)) {
    return oddsProviderCache.get(espnId) ?? null;
  }

  const provider = await getDBOddsProviderByEspnId(espnId);
  if (!provider) {
    return null;
  }

  oddsProviderCache.set(espnId, provider);
  return provider;
}

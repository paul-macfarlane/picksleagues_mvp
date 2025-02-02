import {
  DBSportLeagueGame,
  upsertDBSportGames,
  UpsertDBSportLeagueGame,
} from "@/db/sportLeagueGames";
import { withDBTransaction } from "@/db/transactions";
import { getActiveDBSportLeagueWeeks } from "@/db/sportLeagueWeeks";
import {
  getESPNEventScoreFromRefUrl,
  getESPNEventsFromRefUrl,
  getESPNEventStatusFromRefUrl,
} from "@/integrations/espn/sportLeagueEvents";
import { getDBSportLeagueTeamByEspnId } from "@/db/sportLeagueTeams";

export async function upsertSportLeagueGamesFromESPN(): Promise<
  DBSportLeagueGame[]
> {
  let dbSportLeagueGames: DBSportLeagueGame[] = [];
  await withDBTransaction(async (tx) => {
    const dbSportWeeks = await getActiveDBSportLeagueWeeks(tx);
    if (!dbSportWeeks.length) {
      console.warn("No active sport weeks found.");
      return;
    }

    const gameUpserts: UpsertDBSportLeagueGame[] = [];
    for (const dbSportWeek of dbSportWeeks) {
      const espnEventsForWeek = await getESPNEventsFromRefUrl(
        dbSportWeek.espnEventsRef,
      );
      for (const espnEvent of espnEventsForWeek) {
        if (!espnEvent.competitions.length) {
          console.warn(
            `No competitions found for event ${espnEvent.id} in week ${dbSportWeek.id}`,
          );
          continue;
        }

        const espnCompetition = espnEvent.competitions[0];

        const espnEventStatus = await getESPNEventStatusFromRefUrl(
          espnCompetition.status.$ref,
        );

        const espnHomeTeam = espnCompetition.competitors.find(
          (c) => c.homeAway === "home",
        );
        if (!espnHomeTeam) {
          console.warn(
            `No home team found for event ${espnEvent.id} in week ${dbSportWeek.id}`,
          );
          continue;
        }

        const espnAwayTeam = espnCompetition.competitors.find(
          (c) => c.homeAway === "away",
        );
        if (!espnAwayTeam) {
          console.warn(
            `No away team found for event ${espnEvent.id} in week ${dbSportWeek.id}`,
          );
          continue;
        }

        const homeDBSportTeam = await getDBSportLeagueTeamByEspnId(
          espnHomeTeam.id,
          tx,
        );
        if (!homeDBSportTeam) {
          console.warn(
            `No home team found in db for event ${espnEvent.id} in week ${dbSportWeek.id}`,
          );
          continue;
        }

        const awayDBSportTeam = await getDBSportLeagueTeamByEspnId(
          espnAwayTeam.id,
          tx,
        );
        if (!awayDBSportTeam) {
          console.warn(
            `No away team found in db for event ${espnEvent.id} in week ${dbSportWeek.id}`,
          );
          continue;
        }

        const espnHomeTeamScore = await getESPNEventScoreFromRefUrl(
          espnHomeTeam.score.$ref,
        );
        const espnAwayTeamScore = await getESPNEventScoreFromRefUrl(
          espnAwayTeam.score.$ref,
        );

        gameUpserts.push({
          weekId: dbSportWeek.id,
          startTime: new Date(espnEvent.date),
          status: espnEventStatus.type.name,
          clock: espnEventStatus.displayClock,
          period: espnEventStatus.period,
          homeTeamId: homeDBSportTeam.id,
          homeTeamScore: espnHomeTeamScore.value,
          awayTeamId: awayDBSportTeam.id,
          awayTeamScore: espnAwayTeamScore.value,
          espnId: espnEvent.id,
          espnOddsRef: espnCompetition.odds.$ref,
        });
      }
    }

    if (gameUpserts.length > 0) {
      dbSportLeagueGames = await upsertDBSportGames(gameUpserts, tx);
    }
  });

  return dbSportLeagueGames;
}

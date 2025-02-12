import {
  sportLeagueGames,
  sportLeagueGameOdds,
  sportLeagueTeams,
  oddsProviders,
} from "@/db/schema";
import { SportLeagueGameStatuses } from "@/models/sportLeagueGames";
import { DateTime } from "luxon";
import { eq, sql } from "drizzle-orm";
import { DBTransaction } from "@/db/transactions";

interface CreateGamesConfig {
  weekId: string;
  leagueId: string;
  weekStart: DateTime;
  tx: DBTransaction;
}

export async function seedSportGames({
  weekId,
  leagueId,
  weekStart,
  tx,
}: CreateGamesConfig) {
  const teams = await tx
    .select()
    .from(sportLeagueTeams)
    .where(eq(sportLeagueTeams.leagueId, leagueId));
  const oddsProvider = await tx
    .insert(oddsProviders)
    .values({
      name: "FAKE ESPN BET",
      espnId: "1234",
    })
    .onConflictDoUpdate({
      target: [oddsProviders.espnId],
      set: {
        name: sql`excluded.name`,
      },
    })
    .returning()
    .get();

  const games = [];
  const now = DateTime.now();
  const usedTeams = new Set();

  for (let i = 0; i < Math.min(8, Math.floor(teams.length / 2)); i++) {
    const availableTeams = teams.filter((team) => !usedTeams.has(team.id));
    if (availableTeams.length < 2) break;

    const homeTeamIndex = Math.floor(Math.random() * availableTeams.length);
    const homeTeam = availableTeams[homeTeamIndex];
    usedTeams.add(homeTeam.id);

    const remainingTeams = availableTeams.filter(
      (team) => team.id !== homeTeam.id,
    );
    const awayTeamIndex = Math.floor(Math.random() * remainingTeams.length);
    const awayTeam = remainingTeams[awayTeamIndex];
    usedTeams.add(awayTeam.id);

    const gameStart = weekStart.plus({ hours: 13 + (i % 3) * 3 });

    let status = SportLeagueGameStatuses.SCHEDULED;
    let homeScore = 0;
    let awayScore = 0;
    let clock = "0:00";
    let period = 1;

    if (gameStart < now) {
      if (gameStart.plus({ hours: 3 }) < now) {
        status = SportLeagueGameStatuses.FINAL;
        homeScore = Math.floor(Math.random() * 35);
        awayScore = Math.floor(Math.random() * 35);
        clock = "0:00";
        period = 4;
      } else {
        status = SportLeagueGameStatuses.IN_PROGRESS;
        homeScore = Math.floor(Math.random() * 21);
        awayScore = Math.floor(Math.random() * 21);
        const minutesPlayed = Math.floor(Math.random() * 60);
        clock = `${Math.floor(minutesPlayed / 15)}:${(minutesPlayed % 15)
          .toString()
          .padStart(2, "0")}`;
        period = Math.floor(minutesPlayed / 15) + 1;
      }
    }

    const game = await tx
      .insert(sportLeagueGames)
      .values({
        weekId,
        startTime: new Date(gameStart.toMillis()),
        status,
        clock,
        period,
        awayTeamId: awayTeam.id,
        awayTeamScore: awayScore,
        homeTeamId: homeTeam.id,
        homeTeamScore: homeScore,
        espnId: `${weekId}-${i + 1}`,
        espnOddsRef: `odds/${weekId}-${i + 1}`,
      })
      .onConflictDoUpdate({
        target: sportLeagueGames.espnId,
        set: {
          status: sql`excluded.status`,
          clock: sql`excluded.clock`,
          period: sql`excluded.period`,
          awayTeamId: sql`excluded.away_team_id`,
          awayTeamScore: sql`excluded.away_team_score`,
          homeTeamId: sql`excluded.home_team_id`,
          homeTeamScore: sql`excluded.home_team_score`,
          espnOddsRef: sql`excluded.espn_odds_ref`,
        },
      })
      .returning()
      .get();

    const spread =
      (Math.floor(Math.random() * 14) + 1) * (Math.random() < 0.5 ? -1 : 1);
    await tx
      .insert(sportLeagueGameOdds)
      .values({
        gameId: game.id,
        providerId: oddsProvider.id,
        favoriteTeamId: spread < 0 ? homeTeam.id : awayTeam.id,
        underDogTeamId: spread < 0 ? awayTeam.id : homeTeam.id,
        spread: Math.abs(spread),
      })
      .onConflictDoUpdate({
        target: [sportLeagueGameOdds.gameId, sportLeagueGameOdds.providerId],
        set: {
          favoriteTeamId: sql`excluded.favorite_team_id`,
          underDogTeamId: sql`excluded.under_dog_team_id`,
          spread: sql`excluded.spread`,
        },
      });

    games.push(game);
  }

  return games;
}

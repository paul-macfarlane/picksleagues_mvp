import { NextRequest } from "next/server";
import {
  PicksLeaguePickStatuses,
  getGamePickStatus,
} from "@/shared/picksLeaguePicks";
import {
  getActiveDBPicksLeagueSeasons,
  getDBPicksLeagueSeasonsAndMembersWithoutStandings,
} from "@/db/picksLeagueSeasons";
import {
  DBPicksLeagueStandings,
  getDBPicksLeagueStandingsForSeason,
  upsertDBPicksLeagueStandings,
} from "@/db/picksLeagueStandings";
import {
  getDBPicksFinalizedWithoutStatusForLeague,
  upsertDBPicksLeaguePicks,
} from "@/db/picksLeaguesPicks";
import { withDBTransaction } from "@/db/transactions";

function getPointsFromStandings(standings: DBPicksLeagueStandings) {
  return standings.wins + standings.pushes * 0.5;
}

function assignRanks(
  standings: DBPicksLeagueStandings[],
): DBPicksLeagueStandings[] {
  standings.sort((a, b) => b.points - a.points);

  let currentRank = 1;
  let previousPoints: number | null = null;
  let tiedCount = 0;

  return standings.map((standing) => {
    const entryPoints = standing.points;

    if (entryPoints === previousPoints) {
      tiedCount++;
    } else {
      currentRank += tiedCount;
      tiedCount = 1;
    }

    previousPoints = entryPoints;
    return { ...standing, rank: currentRank };
  });
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json(
      { message: "Unauthorized" },
      {
        status: 401,
      },
    );
  }

  try {
    await withDBTransaction(async (tx) => {
      // upsert standings for leagues without them
      const dbPicksLeagueSeasonsWithoutStandings =
        await getDBPicksLeagueSeasonsAndMembersWithoutStandings(tx);
      if (dbPicksLeagueSeasonsWithoutStandings.length) {
        await upsertDBPicksLeagueStandings(
          dbPicksLeagueSeasonsWithoutStandings.map((row) => ({
            userId: row.member.userId,
            seasonId: row.season.id,
            wins: 0,
            losses: 0,
            pushes: 0,
            points: 0,
            rank: 1,
          })),
          tx,
        );
      }

      const activeDBPicksLeagueSeasons =
        await getActiveDBPicksLeagueSeasons(tx);
      for (const activeDBPicksLeagueSeason of activeDBPicksLeagueSeasons) {
        const dbPicksLeagueStandingsForSeason =
          await getDBPicksLeagueStandingsForSeason(
            activeDBPicksLeagueSeason.id,
            false,
            tx,
          );

        const dbPicksToUpdate = [];
        const dbPicksAndGames = await getDBPicksFinalizedWithoutStatusForLeague(
          activeDBPicksLeagueSeason.leagueId,
          tx,
        );

        for (const dbPickAndGame of dbPicksAndGames) {
          const indexOfStandings = dbPicksLeagueStandingsForSeason.findIndex(
            (standing) => standing.userId === dbPickAndGame.pick.userId,
          );

          const status = getGamePickStatus(
            dbPickAndGame.game,
            dbPickAndGame.pick,
          );
          dbPicksToUpdate.push({
            ...dbPickAndGame.pick,
            status,
          });
          if (indexOfStandings >= 0) {
            switch (status) {
              case PicksLeaguePickStatuses.WIN:
                dbPicksLeagueStandingsForSeason[indexOfStandings].wins =
                  dbPicksLeagueStandingsForSeason[indexOfStandings].wins + 1;
                break;
              case PicksLeaguePickStatuses.LOSS:
                dbPicksLeagueStandingsForSeason[indexOfStandings].losses =
                  dbPicksLeagueStandingsForSeason[indexOfStandings].losses + 1;
                break;
              case PicksLeaguePickStatuses.PUSH:
                dbPicksLeagueStandingsForSeason[indexOfStandings].pushes =
                  dbPicksLeagueStandingsForSeason[indexOfStandings].pushes + 1;
                break;
            }
            dbPicksLeagueStandingsForSeason[indexOfStandings].points =
              getPointsFromStandings(
                dbPicksLeagueStandingsForSeason[indexOfStandings],
              );
          } else {
            console.warn(
              "unable to find standings for user with id ",
              dbPickAndGame.pick.userId,
            );
          }
        }

        if (dbPicksLeagueStandingsForSeason.length) {
          const rankedStandings = assignRanks(dbPicksLeagueStandingsForSeason);
          await upsertDBPicksLeagueStandings(rankedStandings, tx);
        }

        if (dbPicksToUpdate.length) {
          await upsertDBPicksLeaguePicks(dbPicksToUpdate, tx);
        }
      }
    });
  } catch (e) {
    console.error(e);
  }

  return Response.json({
    success: true,
  });
}

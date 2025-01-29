import { auth } from "@/auth";
import { UpsertDBPicksLeaguePicksSchema } from "@/models/picksLeaguesPicks";
import { getDBPicksLeagueWithMember } from "@/db/picksLeagues";
import { getDBSportLeagueGamesWithOddsFromIds } from "@/db/sportLeagueGames";
import {
  getUserDBPicksLeaguePicksForCurrentWeek,
  createDBPicksLeaguePicks,
} from "@/db/picksLeaguesPicks";
import { getDBUserById } from "@/db/users";
import { PicksLeaguePickTypes } from "@/models/picksLeagues";
import { getCurrentDBSportLeagueWeek } from "@/db/sportLeagueWeeks";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ leagueId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json(
      { error: "Unauthorized" },
      {
        status: 401,
      },
    );
  }

  const dbUser = await getDBUserById(session.user.id);
  if (!dbUser) {
    console.error(`User in session but not in db with id ${session.user.id}`);
    return Response.json(
      { error: "Unauthorized" },
      {
        status: 401,
      },
    );
  }

  const json = await request.json();
  const parsedJson = UpsertDBPicksLeaguePicksSchema.safeParse(json);
  if (!parsedJson.success) {
    return Response.json(
      { error: parsedJson.error }, // this is more for debugging than anything else, the frontend should never be submitting invalid data because it is just a bunch of radio buttons
      {
        status: 400,
      },
    );
  }

  const picksLeagueId = (await params).leagueId;

  const dbPicksLeagueWithMember = await getDBPicksLeagueWithMember(
    picksLeagueId,
    dbUser.id,
  );
  if (!dbPicksLeagueWithMember) {
    return Response.json(
      { error: "League with member not found" },
      {
        status: 404,
      },
    );
  }

  const existingWeekPicks = await getUserDBPicksLeaguePicksForCurrentWeek(
    dbUser.id,
    picksLeagueId,
    dbPicksLeagueWithMember.sportLeagueId,
  );
  if (existingWeekPicks.length) {
    return Response.json(
      {
        error: "Picks for week already made",
      },
      {
        status: 403,
      },
    );
  }

  const dbSportLeagueGamesWithOdds = await getDBSportLeagueGamesWithOddsFromIds(
    parsedJson.data.map((pick) => pick.sportLeagueGameId),
  );
  const weekIds = dbSportLeagueGamesWithOdds.map((game) => game.weekId);
  const weekIdSet = new Set(weekIds);
  if (weekIdSet.size < 1) {
    return Response.json(
      { error: "Week not found for games" },
      {
        status: 404,
      },
    );
  }
  if (weekIdSet.size > 1) {
    return Response.json(
      { error: "Can only submit picks for 1 week at a time" },
      {
        status: 400,
      },
    );
  }

  const now = new Date();
  for (const game of dbSportLeagueGamesWithOdds) {
    if (game.startTime <= now) {
      return Response.json(
        {
          error: "Cannot pick a game that has already started",
        },
        {
          status: 400,
        },
      );
    }
  }

  const currentWeek = await getCurrentDBSportLeagueWeek(
    dbPicksLeagueWithMember.sportLeagueId,
  );
  if (!currentWeek) {
    return Response.json(
      {
        error: "No current week found for sports league",
      },
      {
        status: 404,
      },
    );
  }

  if (currentWeek.id !== weekIds[0]) {
    return Response.json(
      {
        error: "Must make picks for the current week only",
      },
      {
        status: 400,
      },
    );
  }

  if (now > currentWeek.pickLockTime) {
    return Response.json(
      {
        error: "Cannot submit picks after pick lock time",
      },
      {
        status: 403,
      },
    );
  }

  await createDBPicksLeaguePicks(
    parsedJson.data.map((pick) => ({
      leagueId: picksLeagueId,
      spread:
        dbPicksLeagueWithMember.pickType ===
        PicksLeaguePickTypes.AGAINST_THE_SPREAD
          ? dbSportLeagueGamesWithOdds.find(
              (game) => game.id === pick.sportLeagueGameId,
            )!.odds[0].spread // can safely access odds because game would not be fetched without odds existing
          : null,
      userId: dbUser.id,
      type: dbPicksLeagueWithMember.pickType,
      sportLeagueWeekId: weekIds[0], // at this point can safely access
      sportLeagueGameId: pick.sportLeagueGameId,
      teamId: pick.teamId,
      favorite: PicksLeaguePickTypes.AGAINST_THE_SPREAD
        ? dbSportLeagueGamesWithOdds.find(
            (game) => game.id === pick.sportLeagueGameId,
          )!.odds[0].favoriteTeamId === pick.teamId // can safely access odds because game would not be fetched without odds existing
        : null,
    })),
  );

  return Response.json({
    success: true,
  });
}

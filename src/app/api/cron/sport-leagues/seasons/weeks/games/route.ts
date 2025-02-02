import { NextRequest } from "next/server";
import { upsertSportLeagueGamesFromESPN } from "@/services/sportLeagueGames";

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
    const upsertedGames = await upsertSportLeagueGamesFromESPN();
    console.log(
      `upserted ${upsertedGames.length} sport league games from espn`,
    );
  } catch (e) {
    console.error(e);

    return Response.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }

  return Response.json({
    success: true,
  });
}

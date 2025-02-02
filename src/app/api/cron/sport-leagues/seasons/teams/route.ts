import { NextRequest } from "next/server";
import { upsertSportLeagueTeamsFromESPN } from "@/services/sportLeagueTeams";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json(
      { error: "Unauthorized" },
      {
        status: 401,
      },
    );
  }

  try {
    const upsertedTeams = await upsertSportLeagueTeamsFromESPN();
    console.log(
      `upserted ${upsertedTeams.length} sport league teams from espn`,
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

  return Response.json(
    { message: "Success" },
    {
      status: 200,
    },
  );
}

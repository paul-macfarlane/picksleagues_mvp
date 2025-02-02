import { NextRequest } from "next/server";
import { upsertSportLeagueGameOddsFromESPN } from "@/services/sportLeagueGameOdds";

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
    const upsertedOdds = await upsertSportLeagueGameOddsFromESPN();
    console.log(
      `upserted ${upsertedOdds.length} sport league game odds from espn`,
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

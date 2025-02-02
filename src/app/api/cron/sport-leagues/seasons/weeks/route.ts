import { NextRequest } from "next/server";
import { upsertSportLeagueWeeksFromESPN } from "@/services/sportLeagueWeeks";

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
    const upsertedWeeks = await upsertSportLeagueWeeksFromESPN();
    console.log(
      `upserted ${upsertedWeeks.length} sport league weeks from espn`,
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

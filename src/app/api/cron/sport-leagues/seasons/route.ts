import { NextRequest } from "next/server";
import { upsertSportLeagueSeasonsFromESPN } from "@/services/sportLeagueSeasons";

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
    const upsertedSeasons = await upsertSportLeagueSeasonsFromESPN();
    console.log(
      `upserted ${upsertedSeasons.length} sport league seasons from ESPN`,
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

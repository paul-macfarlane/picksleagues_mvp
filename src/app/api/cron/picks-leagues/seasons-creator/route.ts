import { createPicksLeagueSeasonsWhereLatestSeasonMissing } from "@/services/picksLeagueSeasons";
import { NextRequest, NextResponse } from "next/server";

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
    await createPicksLeagueSeasonsWhereLatestSeasonMissing();
  } catch (e) {
    console.error(e);

    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }

  return NextResponse.json(
    { success: true },
    {
      status: 200,
    },
  );
}

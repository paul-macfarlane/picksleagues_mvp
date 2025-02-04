import { auth } from "@/auth";
import { ApplicationError } from "@/models/errors";
import { removePicksLeagueMember } from "@/services/picksLeagueMembers";
import { NextRequest } from "next/server";

export async function DELETE(
  _request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ userId: string; leagueId: string }>;
  },
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

  const { leagueId, userId: memberUserId } = await params;

  try {
    await removePicksLeagueMember(session.user.id, leagueId, memberUserId);
  } catch (e) {
    let status = 500;
    let message = "Internal Server Error";
    if (e instanceof ApplicationError) {
      status = e.statusCode;
    }
    if (e instanceof Error) {
      message = e.message;
    }

    return Response.json(
      {
        error: message,
      },
      {
        status,
      },
    );
  }

  return Response.json(
    {
      message: "Success",
    },
    {
      status: 200,
    },
  );
}

import { auth } from "@/auth";
import { updatePicksLeagueMemberRole } from "@/services/picksLeagueMembers";
import { ApplicationError } from "@/models/errors";

export async function PATCH(
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

  const leagueId = (await params).leagueId;
  try {
    const json = await request.json();

    await updatePicksLeagueMemberRole({
      userId: session.user.id,
      leagueId,
      ...json,
    });

    return Response.json(
      {
        message: "success",
      },
      {
        status: 200,
      },
    );
  } catch (e) {
    if (e instanceof ApplicationError) {
      return Response.json(
        {
          error: e.message,
        },
        {
          status: e.statusCode,
        },
      );
    }

    return Response.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}

import { auth } from "@/auth";
import { db } from "@/db/client";
import {
  declineDBPicksLeagueInvite,
  getDBPicksLeagueDetailsForInvite,
} from "@/db/picksLeagueInvite";
import { getDBUserById } from "@/db/users";
import {
  ApplicationError,
  BadInputError,
  NotAllowedError,
  NotFoundError,
} from "@/models/errors";
import { NextRequest } from "next/server";
import { z } from "zod";

// this route is for declining direct user invites
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> },
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

  try {
    const dbUser = await getDBUserById(session.user.id);
    if (!dbUser) {
      throw new NotFoundError("User not found");
    }

    const directInviteParsed = z
      .string()
      .uuid()
      .safeParse((await params).inviteId);
    if (!directInviteParsed.success) {
      throw new BadInputError(directInviteParsed.error.message);
    }

    const inviteId = directInviteParsed.data;
    const dbLeague = await getDBPicksLeagueDetailsForInvite(inviteId);
    if (!dbLeague) {
      throw new NotFoundError("League not found");
    }

    if (dbLeague.invite.userId !== session.user.id) {
      throw new NotAllowedError("You cannot decline this invite");
    }

    if (dbLeague.invite.acceptedByUserId === session.user.id) {
      throw new NotAllowedError("You have already accepted this invite");
    }

    await declineDBPicksLeagueInvite(inviteId);

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof ApplicationError) {
      return Response.json(
        {
          errors: {
            form: error.message,
          },
        },
        {
          status: error.statusCode,
        },
      );
    }

    return Response.json(
      {
        errors: {
          form: "Internal Server Error",
        },
      },
      {
        status: 500,
      },
    );
  }
}

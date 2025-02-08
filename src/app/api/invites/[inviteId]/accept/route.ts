import { auth } from "@/auth";
import {
  acceptDBPicksLeagueInvite,
  getDBPicksLeagueDetailsForInvite,
} from "@/db/picksLeagueInvite";
import {
  createDBPicksLeagueMember,
  getDBPicksLeagueMember,
} from "@/db/picksLeagueMembers";
import { getNextDBPicksLeagueSeason } from "@/db/picksLeagueSeasons";
import { upsertDBPicksLeagueStandings } from "@/db/picksLeagueStandings";
import { withDBTransaction } from "@/db/transactions";
import { getDBUserById } from "@/db/users";
import {
  ApplicationError,
  BadInputError,
  NotAllowedError,
  NotFoundError,
} from "@/models/errors";
import { PicksLeagueMemberRoles } from "@/models/picksLeagueMembers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// this route is for accepting direct user invites
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
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
      throw new NotAllowedError("You cannot accept this invite");
    }

    if (dbLeague.invite.acceptedByUserId === session.user.id) {
      return Response.json(
        {
          message: "Success",
        },
        {
          status: 200,
        },
      );
    }

    if (dbLeague.invite.expiresAt < new Date()) {
      throw new NotAllowedError("Invite has expired");
    }

    if (dbLeague.memberCount >= dbLeague.size) {
      throw new NotAllowedError("League is full");
    }

    const dbPicksLeagueSeason = await getNextDBPicksLeagueSeason(dbLeague.id);

    const existingLeagueMember = await getDBPicksLeagueMember(
      dbLeague.id,
      dbUser.id,
    );
    if (!existingLeagueMember) {
      const createDBLeagueMemberData = {
        userId: dbUser.id,
        leagueId: dbLeague.id,
        role: PicksLeagueMemberRoles.MEMBER,
      };

      await withDBTransaction(async (tx) => {
        await acceptDBPicksLeagueInvite(dbUser.id, dbLeague.invite.id, tx);

        const dbLeagueMember = await createDBPicksLeagueMember(
          createDBLeagueMemberData,
          tx,
        );
        if (!dbLeagueMember) {
          console.error(
            "Unable to create league member with ",
            createDBLeagueMemberData,
          );

          throw new Error("Unable to create league member");
        }

        if (dbPicksLeagueSeason) {
          await upsertDBPicksLeagueStandings(
            [
              {
                userId: dbUser.id,
                seasonId: dbPicksLeagueSeason.id,
                wins: 0,
                losses: 0,
                pushes: 0,
                points: 0,
                rank: 1, // users can't join mid-season so can assume a tie for first
              },
            ],
            tx,
          );
        }
      });
    }

    return Response.json(
      {
        message: "Success",
      },
      {
        status: 200,
      },
    );
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

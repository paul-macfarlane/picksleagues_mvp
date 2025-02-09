import { auth } from "@/auth";
import {
  getDBPicksLeagueInviteById,
  updateDBPicksLeagueInvite,
} from "@/db/picksLeagueInvite";
import { getDBPicksLeagueMember } from "@/db/picksLeagueMembers";
import { getDBUserById } from "@/db/users";
import {
  ApplicationError,
  BadInputError,
  NotAllowedError,
  NotFoundError,
} from "@/models/errors";
import { PicksLeagueMemberRoles } from "@/models/picksLeagueMembers";
import { z } from "zod";

const UpdateInviteSchema = z.object({
  role: z.enum([
    PicksLeagueMemberRoles.MEMBER,
    PicksLeagueMemberRoles.COMMISSIONER,
  ]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ inviteId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const parsedData = UpdateInviteSchema.safeParse(data);
    if (!parsedData.success) {
      throw new BadInputError(parsedData.error.message);
    }

    const inviteIdParsed = z
      .string()
      .uuid()
      .safeParse((await params).inviteId);
    if (!inviteIdParsed.success) {
      throw new BadInputError(inviteIdParsed.error.message);
    }

    const inviteId = inviteIdParsed.data;
    const { role } = parsedData.data;

    const dbUser = await getDBUserById(session.user.id);
    if (!dbUser) {
      throw new NotFoundError("User not found");
    }

    const dbInvite = await getDBPicksLeagueInviteById(inviteId);
    if (!dbInvite) {
      throw new NotFoundError("Invite not found");
    }

    const picksLeagueMember = await getDBPicksLeagueMember(
      dbInvite.leagueId,
      dbUser.id,
    );
    if (!picksLeagueMember) {
      throw new NotAllowedError("You are not a part of this league");
    }
    if (picksLeagueMember.role !== PicksLeagueMemberRoles.COMMISSIONER) {
      throw new NotAllowedError(
        "You must be a commissioner to update this invite",
      );
    }

    const updatedInvite = await updateDBPicksLeagueInvite(inviteId, {
      role,
    });
    if (!updatedInvite) {
      throw new ApplicationError("Invite not updated");
    }

    return Response.json({ success: true });
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

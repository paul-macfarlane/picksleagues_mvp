"use server";

import { getDBPicksLeagueMember } from "@/db/picksLeagueMembers";
import {
  deleteDBPicksLeagueInvite,
  getDBPicksLeagueInviteById,
} from "@/db/picksLeagueInvite";
import { PicksLeagueMemberRoles } from "@/models/picksLeagueMembers";
import { z } from "zod";
import { auth } from "@/auth";

const RevokeInviteSchema = z.object({
  inviteId: z.string().uuid(),
});

export async function revokeInviteAction(
  _prevState: unknown,
  formData: FormData,
) {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      errors: {
        form: "You must be logged in to revoke invites",
      },
    };
  }

  const parsed = RevokeInviteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      errors: {
        form: "Invalid invite ID",
      },
    };
  }

  const invite = await getDBPicksLeagueInviteById(parsed.data.inviteId);
  if (!invite) {
    return {
      errors: {
        form: "Invite not found",
      },
    };
  }

  const member = await getDBPicksLeagueMember(invite.leagueId, session.user.id);
  if (!member || member.role !== PicksLeagueMemberRoles.COMMISSIONER) {
    return {
      errors: {
        form: "You must be a commissioner to revoke invites",
      },
    };
  }

  await deleteDBPicksLeagueInvite(invite.id);

  return { success: true };
}

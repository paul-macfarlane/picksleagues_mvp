"use server";

import { auth } from "@/auth";
import { getDBPicksLeagueByIdWithMemberCount } from "@/db/picksLeagues";
import { redirect } from "next/navigation";
import {
  createDBPicksLeagueInvite,
  getOpenDBPicksLeagueInvitesForUser,
} from "@/db/picksLeagueInvite";
import {
  DirectInviteFormSchema,
  PICKS_LEAGUE_INVITE_EXPIRATION,
  PicksLeagueInviteFormSchema,
} from "@/models/picksLeagueInvites";
import { AUTH_URL } from "@/models/auth";
import { getDBPicksLeagueMember } from "@/db/picksLeagueMembers";
import { getDBUserById } from "@/db/users";
import { PicksLeagueMemberRoles } from "@/models/picksLeagueMembers";

export interface LeagueInviteActionState {
  errors?: {
    form?: string;
    leagueId?: string;
  };
  inviteUrl?: string;
}

export async function picksLeagueInviteAction(
  _prevState: LeagueInviteActionState,
  formData: FormData,
): Promise<LeagueInviteActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return redirect(AUTH_URL);
  }

  const dbUser = await getDBUserById(session.user.id);
  if (!dbUser) {
    console.error(
      `unable to find db user using id from session ${session.user.id} on invite action`,
    );
    return redirect(AUTH_URL);
  }

  // Try parsing as direct invite first
  const directInviteParsed = DirectInviteFormSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (directInviteParsed.success) {
    const { leagueId, userId, role } = directInviteParsed.data;

    const dbPicksLeague = await getDBPicksLeagueByIdWithMemberCount(leagueId);
    if (!dbPicksLeague) {
      return {
        errors: {
          leagueId: "League not found",
        },
      };
    }

    if (dbPicksLeague.memberCount >= dbPicksLeague.size) {
      return {
        errors: {
          leagueId: "League cannot be joined because it is full",
        },
      };
    }

    const picksLeagueMember = await getDBPicksLeagueMember(
      dbPicksLeague.id,
      dbUser.id,
    );
    if (!picksLeagueMember) {
      return {
        errors: {
          form: "Cannot send invite for a league you are not a part of",
        },
      };
    }

    if (picksLeagueMember.role !== PicksLeagueMemberRoles.COMMISSIONER) {
      return {
        errors: {
          form: "Cannot send invite for a league you are not the commissioner of",
        },
      };
    }

    // Check if user exists
    const invitedUser = await getDBUserById(userId);
    if (!invitedUser) {
      return {
        errors: {
          form: "User not found",
        },
      };
    }

    // Check if user is already a member
    const existingMember = await getDBPicksLeagueMember(leagueId, userId);
    if (existingMember) {
      return {
        errors: {
          form: "User is already a member of this league",
        },
      };
    }

    const existingInvites = await getOpenDBPicksLeagueInvitesForUser(
      leagueId,
      userId,
    );
    if (existingInvites.length > 0) {
      return {
        errors: {
          form: "User is already invited to this league",
        },
      };
    }

    const createInviteData = {
      leagueId,
      userId,
      expiresAt: new Date(
        new Date().getTime() + PICKS_LEAGUE_INVITE_EXPIRATION,
      ),
      role,
    };

    const dbInvite = await createDBPicksLeagueInvite(createInviteData);
    if (!dbInvite) {
      console.error("Unable to create league invite with ", createInviteData);

      return {
        errors: {
          form: "Unable to generate invite. Please try again later.",
        },
      };
    }

    return {};
  }

  // If not a direct invite, try parsing as a link invite
  const parsed = PicksLeagueInviteFormSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) {
    return {
      errors: {
        leagueId: parsed.error.issues
          .filter((error) => error.path.join(".") === "leagueId")
          .map((error) => error.message)
          .join(", "),
      },
    };
  }

  const dbPicksLeague = await getDBPicksLeagueByIdWithMemberCount(
    parsed.data.leagueId,
  );
  if (!dbPicksLeague) {
    return {
      errors: {
        leagueId: "League not found",
      },
    };
  }

  if (dbPicksLeague.memberCount >= dbPicksLeague.size) {
    return {
      errors: {
        leagueId: "League cannot be joined because it is full",
      },
    };
  }

  const picksLeagueMember = await getDBPicksLeagueMember(
    dbPicksLeague.id,
    dbUser.id,
  );
  if (!picksLeagueMember) {
    return {
      errors: {
        form: "Cannot send invite for a league you are not a part of",
      },
    };
  }

  if (picksLeagueMember.role !== PicksLeagueMemberRoles.COMMISSIONER) {
    return {
      errors: {
        form: "Cannot send invite for a league you are not the commissioner of",
      },
    };
  }

  const createInviteData = {
    leagueId: parsed.data.leagueId,
    expiresAt: new Date(new Date().getTime() + PICKS_LEAGUE_INVITE_EXPIRATION),
    role: parsed.data.role,
  };
  const dbInvite = await createDBPicksLeagueInvite(createInviteData);
  if (!dbInvite) {
    console.error("Unable to create league invite with ", createInviteData);

    return {
      errors: {
        form: "Unable to generate invite. Please try again later.",
      },
    };
  }

  return {
    inviteUrl: `${process.env.NEXT_PUBLIC_HOST!}/invites/${dbInvite.id}`,
  };
}

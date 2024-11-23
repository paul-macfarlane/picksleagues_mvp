"use server";

import { auth } from "@/auth";
import {
  createDBLeagueInvite,
  getDBLeagueByIdWithMemberCount,
} from "@/db/leagues";
import {
  LEAGUE_INVITE_EXPIRATION,
  LeagueInviteFormSchema,
} from "@/models/leagues";
import { redirect } from "next/navigation";

interface LeagueInviteActionState {
  errors?: {
    form?: string;
    leagueId?: string;
  };
  inviteUrl?: string;
}

export async function leagueInviteFormAction(
  _prevState: LeagueInviteActionState,
  formData: FormData,
): Promise<LeagueInviteActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return redirect("/auth");
  }

  const parsed = LeagueInviteFormSchema.safeParse(Object.fromEntries(formData));
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

  const dbLeague = await getDBLeagueByIdWithMemberCount(parsed.data.leagueId);
  if (!dbLeague) {
    return {
      errors: {
        leagueId: "League not found",
      },
    };
  }

  if (dbLeague.memberCount >= dbLeague.size) {
    return {
      errors: {
        leagueId: "League cannot be joined because it is full",
      },
    };
  }

  const createInviteData = {
    leagueId: parsed.data.leagueId,
    expiresAt: new Date(new Date().getTime() + LEAGUE_INVITE_EXPIRATION),
  };
  const dbInvite = await createDBLeagueInvite(createInviteData);
  if (!dbInvite) {
    console.error("Unable to create league invite with ", createInviteData);

    return {
      errors: {
        form: "Unable to generate invite. Please try again later.",
      },
    };
  }

  return {
    inviteUrl: `${process.env.HOST!}/invites/${dbInvite.id}`,
  };
}

"use server";

import { auth } from "@/auth";
import {
  getDBLeagueByIdWithMemberCount,
  createDBLeagueMember,
} from "@/db/leagues";
import { getDBUserById } from "@/db/users";
import {
  JoinLeagueSchema,
  LeagueVisibilities,
  LeagueMemberRoles,
} from "@/models/leagues";
import { redirect } from "next/navigation";

interface JoinLeagueActionFormState {
  errors?: {
    leagueId?: string;
    form?: string;
  };
}

export async function joinLeagueAction(
  _prevState: JoinLeagueActionFormState,
  formData: FormData,
): Promise<JoinLeagueActionFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth");
  }

  const dbUser = await getDBUserById(session.user.id);
  if (!dbUser) {
    console.error(
      `User with id ${session.user.id} from session not found in db while joining league`,
    );

    return {
      errors: {
        form: "An unexpected error occurred. Please try again later.",
      },
    };
  }

  const parsed = JoinLeagueSchema.safeParse(Object.fromEntries(formData));
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

  if (
    dbLeague.leagueVisibility !== LeagueVisibilities.LEAGUE_VISIBILITY_PUBLIC
  ) {
    return {
      errors: {
        leagueId: "League cannot be joined without invite",
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

  const createDBLeagueMemberData = {
    userId: dbUser.id,
    leagueId: parsed.data.leagueId,
    role: LeagueMemberRoles.MEMBER,
  };
  const dbLeagueMember = await createDBLeagueMember(
    createDBLeagueMemberData,
    undefined,
  );
  if (!dbLeagueMember) {
    console.error(
      "Unable to create league member with ",
      createDBLeagueMemberData,
    );

    return {
      errors: {
        form: "An unexpected error occured. Please try again later.",
      },
    };
  }

  return {};
}

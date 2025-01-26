"use server";

import { auth } from "@/auth";
import { getDBPicksLeagueByIdWithMemberCount } from "@/db/picksLeagues";
import { getDBUserById } from "@/db/users";
import { PicksLeagueVisibilities } from "@/models/picksLeagues";
import { redirect } from "next/navigation";
import { createDBPicksLeagueMember } from "@/db/picksLeagueMembers";
import { PicksLeagueMemberRoles } from "@/models/picksLeagueMembers";
import { JoinPicksLeagueSchema } from "@/models/picksLeagueInvites";
import { AUTH_URL } from "@/models/auth";

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
    return redirect(AUTH_URL);
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

  const parsed = JoinPicksLeagueSchema.safeParse(Object.fromEntries(formData));
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

  if (dbPicksLeague.visibility !== PicksLeagueVisibilities.PUBLIC) {
    return {
      errors: {
        leagueId: "League cannot be joined without invite",
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

  const createDBLeagueMemberData = {
    userId: dbUser.id,
    leagueId: parsed.data.leagueId,
    role: PicksLeagueMemberRoles.MEMBER,
  };
  const dbLeagueMember = await createDBPicksLeagueMember(
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

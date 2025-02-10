"use server";

import { auth } from "@/auth";
import { getDBPicksLeagueByIdWithMemberCount } from "@/db/picksLeagues";
import { getDBUserById } from "@/db/users";
import {
  getPicksLeagueHomeUrl,
  PicksLeagueVisibilities,
} from "@/models/picksLeagues";
import { redirect } from "next/navigation";
import {
  createDBPicksLeagueMember,
  getDBPicksLeagueMember,
} from "@/db/picksLeagueMembers";
import { PicksLeagueMemberRoles } from "@/models/picksLeagueMembers";
import { JoinPicksLeagueSchema } from "@/models/picksLeagueInvites";
import { AUTH_URL } from "@/models/auth";
import { withDBTransaction } from "@/db/transactions";
import { getNextDBPicksLeagueSeason } from "@/db/picksLeagueSeasons";
import { upsertDBPicksLeagueStandings } from "@/db/picksLeagueStandings";

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

  const nextDBPicksLeagueSeason = await getNextDBPicksLeagueSeason(
    parsed.data.leagueId,
  );

  const existingLeagueMember = await getDBPicksLeagueMember(
    dbPicksLeague.id,
    dbUser.id,
  );
  if (existingLeagueMember) {
    return redirect(getPicksLeagueHomeUrl(parsed.data.leagueId));
  }

  try {
    await withDBTransaction(async (tx) => {
      const createDBLeagueMemberData = {
        userId: dbUser.id,
        leagueId: parsed.data.leagueId,
        role: PicksLeagueMemberRoles.MEMBER,
      };
      const dbLeagueMember = await createDBPicksLeagueMember(
        createDBLeagueMemberData,
        tx,
      );
      if (!dbLeagueMember) {
        throw new Error(
          `Unable to create league member with ${JSON.stringify(createDBLeagueMemberData)}`,
        );
      }

      if (nextDBPicksLeagueSeason) {
        await upsertDBPicksLeagueStandings(
          [
            {
              userId: dbUser.id,
              seasonId: nextDBPicksLeagueSeason.id,
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
  } catch (e) {
    return {
      errors: {
        form: "An unexpected error occurred. Please try again later.",
      },
    };
  }

  return redirect(getPicksLeagueHomeUrl(parsed.data.leagueId));
}

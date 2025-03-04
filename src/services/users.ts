import {
  DBPicksLeagueWithMembers,
  deleteDBPicksLeagues,
  getUserDBPicksLeaguesWithMembers,
} from "@/db/picksLeagues";
import { dbUsernameAvailable, getDBUserById, updateDBUser } from "@/db/users";
import { PicksLeagueMemberRoles } from "@/models/picksLeagueMembers";
import { BadInputError, NotAllowedError, NotFoundError } from "@/models/errors";
import { withDBTransaction } from "@/db/transactions";
import { deleteUserDBAccount } from "@/db/accounts";
import { deleteUserDBSessions } from "@/db/sessions";
import { deleteUserDBPicksLeagueMemberships } from "@/db/picksLeagueMembers";
import {
  deleteDBPicksLeagueStandingsByIds,
  getUserDBPicksLeagueStandingsForFutureSeasons,
} from "@/db/picksLeagueStandings";
import { generateFromEmail, generateUsername } from "unique-username-generator";
import { MAX_USERNAME_LENGTH, UpdateProfileFormSchema } from "@/models/users";
import { z } from "zod";

export function cannotDeleteSoloCommissionerErrorMessage(
  leagues: DBPicksLeagueWithMembers[],
) {
  return `You are a solo commissioner of the following leagues: ${leagues.map((league) => `"${league.name}"`).join(",")}. You need to assign at least 1 other commissioner in each league before deleting your account.`;
}

export async function getLeaguesUserSoloCommissionerOf(
  userId: string,
  includeLeaguesOnlyMemberOf = false,
): Promise<DBPicksLeagueWithMembers[]> {
  const leaguesWithMembers = await getUserDBPicksLeaguesWithMembers(userId);

  return leaguesWithMembers.filter((league) => {
    const userIsCommissioner = !!league.members.find(
      (member) =>
        member.userId === userId &&
        member.role === PicksLeagueMemberRoles.COMMISSIONER,
    );
    const otherCommissionerExists = !!league.members.find(
      (member) =>
        member.userId !== userId &&
        member.role === PicksLeagueMemberRoles.COMMISSIONER,
    );

    return (
      userIsCommissioner &&
      !otherCommissionerExists &&
      (includeLeaguesOnlyMemberOf || league.members.length > 1)
    );
  });
}

export async function deleteAccount(userId: string): Promise<void> {
  const dbUser = await getDBUserById(userId);
  if (!dbUser) {
    return;
  }

  const leaguesSoloCommissionerOf = await getLeaguesUserSoloCommissionerOf(
    userId,
    true,
  );
  const leaguesWithMembersSoloCommissionerOf = leaguesSoloCommissionerOf.filter(
    (league) => league.members.length > 1,
  );
  if (leaguesWithMembersSoloCommissionerOf.length) {
    throw new NotAllowedError(
      cannotDeleteSoloCommissionerErrorMessage(
        leaguesWithMembersSoloCommissionerOf,
      ),
    );
  }

  const leaguesWithNoMembersOtherThanSelf = leaguesSoloCommissionerOf.filter(
    (league) => league.members.length === 1,
  );

  const futureDBPicksLeagueStandings =
    await getUserDBPicksLeagueStandingsForFutureSeasons(dbUser.id);

  await withDBTransaction(async (tx) => {
    await updateDBUser(
      dbUser.id,
      {
        name: "Deleted User",
        firstName: "Deleted",
        lastName: "User",
        username: "deleted-user",
        email: "deleteduser@picksleagues.com",
        emailVerified: null,
        image: null,
      },
      tx,
    );

    await deleteUserDBAccount(dbUser.id, tx);
    await deleteUserDBSessions(dbUser.id, tx);
    await deleteUserDBPicksLeagueMemberships(dbUser.id, tx);
    if (futureDBPicksLeagueStandings.length > 0) {
      await deleteDBPicksLeagueStandingsByIds(
        futureDBPicksLeagueStandings.map((standing) => standing.id),
        tx,
      );
    }
    if (leaguesWithNoMembersOtherThanSelf.length > 0) {
      await deleteDBPicksLeagues(
        leaguesWithNoMembersOtherThanSelf.map((league) => league.id),
        tx,
      );
    }
  });
}

export async function generateUserName(email?: string): Promise<string | null> {
  let attempts = 0;
  let username: string | null = null;
  while (!username && attempts < 5) {
    attempts++;
    const usernameCandidate =
      email && attempts === 1
        ? generateFromEmail(email).slice(0, MAX_USERNAME_LENGTH)
        : generateUsername("", 3, MAX_USERNAME_LENGTH);
    if (await dbUsernameAvailable(usernameCandidate)) {
      username = usernameCandidate;
    }
  }

  return username;
}

export async function updateUserProfile(userId: string, data: unknown) {
  const dbUser = await getDBUserById(userId);
  if (!dbUser) {
    throw new NotFoundError(`User with ID ${userId} not found`);
  }

  const parsedData = UpdateProfileFormSchema.safeParse(data);
  if (!parsedData.success) {
    throw new BadInputError(
      `Invalid profile data: ${parsedData.error.errors.map((e) => `${e.path}: ${e.message}`).join(", ")}`,
    );
  }

  if (
    parsedData.data.username !== dbUser.username &&
    !(await dbUsernameAvailable(parsedData.data.username))
  ) {
    throw new BadInputError("Username is already taken");
  }

  const updateData = {
    username: parsedData.data.username,
    firstName: parsedData.data.firstName,
    lastName: parsedData.data.lastName,
    image: parsedData.data.imageUrl?.length ? parsedData.data.imageUrl : null,
    timezone: parsedData.data.timezone,
  };

  const updatedUser = await updateDBUser(userId, updateData);
  if (!updatedUser) {
    throw new Error("Failed to update user profile");
  }

  return updatedUser;
}

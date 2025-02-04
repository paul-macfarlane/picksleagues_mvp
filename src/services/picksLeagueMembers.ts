import { z } from "zod";
import { PicksLeagueMemberRoles } from "@/models/picksLeagueMembers";
import {
  DBPicksLeagueMember,
  deleteDBPicksLeagueMember,
  getDBPicksLeagueMember,
  getDBPicksLeagueMembersWithRole,
  updateDBPicksLeagueMember,
} from "@/db/picksLeagueMembers";
import {
  ApplicationError,
  BadInputError,
  NotAllowedError,
  NotFoundError,
} from "@/models/errors";
import { picksLeagueIsInSeason } from "@/services/picksLeagues";
import { withDBTransaction } from "@/db/transactions";
import { getNextDBPicksLeagueSeason } from "@/db/picksLeagueSeasons";
import { deleteDBPicksLeagueStandingsRecord } from "@/db/picksLeagueStandings";

export const UpdatePicksLeagueMemberRoleSchema = z.object({
  userId: z.string().trim().uuid(),
  leagueId: z.string().trim().uuid(),
  memberId: z.string().trim().uuid(),
  role: z.enum([
    PicksLeagueMemberRoles.MEMBER,
    PicksLeagueMemberRoles.COMMISSIONER,
  ]),
});

export async function updatePicksLeagueMemberRole(
  input: unknown,
): Promise<DBPicksLeagueMember> {
  const parsedInput = UpdatePicksLeagueMemberRoleSchema.safeParse(input);
  if (!parsedInput.success) {
    throw new BadInputError(parsedInput.error.message);
  }

  const userMember = await getDBPicksLeagueMember(
    parsedInput.data.leagueId,
    parsedInput.data.userId,
  );
  if (!userMember) {
    throw new NotAllowedError("User is not a member of league");
  }
  if (userMember.role !== PicksLeagueMemberRoles.COMMISSIONER) {
    throw new NotAllowedError(
      `User is not a ${PicksLeagueMemberRoles.COMMISSIONER}`,
    );
  }

  const picksLeagueMember = await getDBPicksLeagueMember(
    parsedInput.data.leagueId,
    parsedInput.data.memberId,
  );
  if (!picksLeagueMember) {
    throw new NotFoundError("League member does not exist");
  }

  const updatedRecord = await updateDBPicksLeagueMember({
    leagueId: parsedInput.data.leagueId,
    userId: parsedInput.data.memberId,
    role: parsedInput.data.role,
  });
  if (!updatedRecord) {
    throw new ApplicationError("League member was not updated");
  }

  return updatedRecord;
}

export async function removePicksLeagueMember(
  userId: string,
  picksLeagueId: string,
  memberUserId: string,
): Promise<void> {
  if (userId === memberUserId) {
    throw new BadInputError("User cannot remove themselves");
  }

  const userMember = await getDBPicksLeagueMember(picksLeagueId, userId);
  if (!userMember || userMember.role !== PicksLeagueMemberRoles.COMMISSIONER) {
    throw new NotAllowedError("User is not a league commissioner");
  }

  const member = await getDBPicksLeagueMember(picksLeagueId, memberUserId);
  if (!member) {
    return; // no user to remove
  }

  const leagueIsInSeason = await picksLeagueIsInSeason(picksLeagueId);
  if (leagueIsInSeason) {
    throw new NotAllowedError("Cannot remove member in season");
  }

  await removeUserLeagueData(userId, picksLeagueId);
}

async function removeUserLeagueData(userId: string, picksLeagueId: string) {
  // remove standings record from future season if it exists
  const nextPicksLeagueSeason = await getNextDBPicksLeagueSeason(picksLeagueId);
  await withDBTransaction(async (tx) => {
    if (nextPicksLeagueSeason) {
      await deleteDBPicksLeagueStandingsRecord(
        userId,
        nextPicksLeagueSeason.id,
        tx,
      );
    }

    await deleteDBPicksLeagueMember(userId, picksLeagueId, tx);
  });
}

export async function leavePicksLeague(
  userId: string,
  picksLeagueId: string,
): Promise<void> {
  const userMember = await getDBPicksLeagueMember(picksLeagueId, userId);
  if (!userMember) {
    return; // user already is not a member
  }

  const leagueIsInSeason = await picksLeagueIsInSeason(picksLeagueId);
  if (leagueIsInSeason) {
    throw new NotAllowedError("Cannot leave league in season");
  }

  if (userMember.role === PicksLeagueMemberRoles.COMMISSIONER) {
    const commissioners = await getDBPicksLeagueMembersWithRole(
      picksLeagueId,
      PicksLeagueMemberRoles.COMMISSIONER,
    );
    if (commissioners.length < 2) {
      throw new NotAllowedError(
        "Cannot leave league until at least one other member is given the commissioner role",
      );
    }
  }

  await removeUserLeagueData(userId, picksLeagueId);
}

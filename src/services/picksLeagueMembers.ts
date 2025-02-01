import { z } from "zod";
import { PicksLeagueMemberRoles } from "@/models/picksLeagueMembers";
import {
  DBPicksLeagueMember,
  getDBPicksLeagueMember,
  updateDBPicksLeagueMember,
} from "@/db/picksLeagueMembers";
import {
  ApplicationError,
  BadInputError,
  NotAllowedError,
  NotFoundError,
} from "@/models/errors";

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
  console.log("input", input);
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

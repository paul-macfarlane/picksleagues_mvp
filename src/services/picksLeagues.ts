import { getDBStartAndEndWeekForLeagueActiveSeason } from "@/db/sportLeagueWeeks";
import { getDBPicksLeagueMember } from "@/db/picksLeagueMembers";
import { NotAllowedError } from "@/models/errors";
import { PicksLeagueMemberRoles } from "@/models/picksLeagueMembers";
import { deleteDBPicksLeague } from "@/db/picksLeagues";

export async function picksLeagueIsInSeason(
  picksLeagueId: string,
): Promise<boolean> {
  const dbStartAndEndWeek =
    await getDBStartAndEndWeekForLeagueActiveSeason(picksLeagueId);
  if (!dbStartAndEndWeek) {
    return false;
  }

  const now = new Date();
  return (
    now >= dbStartAndEndWeek.startWeek.startTime &&
    now <= dbStartAndEndWeek.endWeek.endTime
  );
}

export async function deletePicksLeague(
  userId: string,
  picksLeagueId: string,
): Promise<void> {
  const dbLeagueMember = await getDBPicksLeagueMember(picksLeagueId, userId);
  if (
    !dbLeagueMember ||
    dbLeagueMember.role !== PicksLeagueMemberRoles.COMMISSIONER
  ) {
    throw new NotAllowedError(
      "User is not a commissioner of the league and cannot delete it.",
    );
  }

  await deleteDBPicksLeague(picksLeagueId);
}

import { getDBStartAndEndWeekForLeagueActiveSeason } from "@/db/sportLeagueWeeks";

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

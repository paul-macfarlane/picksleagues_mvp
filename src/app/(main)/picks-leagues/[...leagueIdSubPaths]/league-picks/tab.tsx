import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DBSportLeagueWeek,
  DBWeeklyPickDataByUser,
  getCurrentDBSportLeagueWeek,
  getLeagueDBWeeklyPickDataByUser,
} from "@/db/sportLeagueWeeks";
import { PicksLeagueTabIds } from "@/models/picksLeagues";
import { getDBSportLeagueWeekById } from "@/db/sportLeagues";
import { getPrevAndNextDBWeekForPicksLeagueSeason } from "@/services/sportLeagueWeeks";
import { UserPicks } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/league-picks/user-picks";
import { WeekSwitcher } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/WeekSwitcher";
import { DateDisplay } from "@/components/date-display";
import { DBPicksLeagueSeason } from "@/db/picksLeagueSeasons";
import { DBPicksLeagueWithUserRole } from "@/db/picksLeagues";
import { getPointsEarnedAndRemainingFromUserPickData } from "@/shared/picksLeaguePicks";
import { getDBPicksLeagueSeasonStandingsWithMembers } from "@/db/picksLeagueStandings";

export interface LeaguePicksTabProps {
  dbPicksLeague: DBPicksLeagueWithUserRole;
  dbPicksLeagueSeason: DBPicksLeagueSeason;
  seasonType: "current" | "next" | "previous";
  userId: string;
  selectedWeekId: string | null;
}

export async function LeaguePicksTab({
  dbPicksLeague,
  dbPicksLeagueSeason,
  seasonType,
  userId,
  selectedWeekId,
}: LeaguePicksTabProps) {
  if (seasonType === "next") {
    const dbSportLeagueStartWeek = await getDBSportLeagueWeekById(
      dbPicksLeagueSeason.startSportLeagueWeekId,
    );

    return (
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>League Picks</CardTitle>
        </CardHeader>
        <CardContent>
          There are no picks to view now.{" "}
          {dbSportLeagueStartWeek && (
            <>
              Wait until the season starts at{" "}
              <DateDisplay
                timestampMS={dbSportLeagueStartWeek.startTime.getTime()}
              />{" "}
              to view picks.
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  let selectedDBWeek: DBSportLeagueWeek | null;
  if (selectedWeekId) {
    selectedDBWeek = await getDBSportLeagueWeekById(selectedWeekId);
    if (
      !selectedDBWeek ||
      selectedDBWeek.seasonId !== dbPicksLeagueSeason.sportLeagueSeasonId
    ) {
      return (
        <Card className="mx-auto w-full max-w-4xl">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Invalid week</CardDescription>
          </CardHeader>
          <CardContent>
            Invalid week. Please select a different week.
          </CardContent>
        </Card>
      );
    }
  } else if (seasonType === "current") {
    selectedDBWeek = await getCurrentDBSportLeagueWeek(
      dbPicksLeague.sportLeagueId,
    );
  } else {
    // get last week from previous season
    selectedDBWeek = await getDBSportLeagueWeekById(
      dbPicksLeagueSeason.endSportLeagueWeekId,
    );
  }
  if (!selectedDBWeek) {
    return (
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>
            An unexpected error occurred. Please come back later.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const now = new Date();
  const picksLocked = now < selectedDBWeek.pickLockTime;
  let pickData: (DBWeeklyPickDataByUser & {
    weekRank: number;
    seasonRank: number;
    seasonPoints: number;
  })[] = [];
  if (!picksLocked) {
    let rawPickData = await getLeagueDBWeeklyPickDataByUser(
      dbPicksLeague.id,
      selectedDBWeek.id,
    );

    const seasonStandings = await getDBPicksLeagueSeasonStandingsWithMembers(
      dbPicksLeagueSeason.id,
    );

    const pickDataWithPoints = rawPickData.map((data) => {
      const { pointsEarned } =
        getPointsEarnedAndRemainingFromUserPickData(data);
      const seasonStanding = seasonStandings.find((s) => s.user.id === data.id);
      return {
        ...data,
        weekPoints: pointsEarned,
        seasonRank: seasonStanding?.standings.rank ?? 0,
        seasonPoints: seasonStanding?.standings.points ?? 0,
      };
    });

    pickDataWithPoints.sort((a, b) => b.weekPoints - a.weekPoints);

    // Calculate week ranks (handle ties by giving same rank)
    let currentRank = 1;
    let currentPoints = pickDataWithPoints[0]?.weekPoints ?? 0;
    pickData = pickDataWithPoints.map((data, index) => {
      if (data.weekPoints < currentPoints) {
        currentRank = index + 1;
        currentPoints = data.weekPoints;
      }
      return {
        ...data,
        weekRank: currentRank,
        points: data.weekPoints,
      };
    });

    // Move the current user's pick to the front if they're not already first
    const indexOfUser = pickData.findIndex((data) => data.id === userId);
    if (indexOfUser > 0) {
      const userPickData = pickData[indexOfUser];
      pickData.splice(indexOfUser, 1);
      pickData.unshift(userPickData);
    }
  }

  let { previousWeek, nextWeek } =
    await getPrevAndNextDBWeekForPicksLeagueSeason(
      dbPicksLeagueSeason.id,
      selectedDBWeek.id,
    );
  const activeWeekIsSelectedWeek =
    selectedDBWeek.startTime <= now && selectedDBWeek.endTime >= now;
  if (activeWeekIsSelectedWeek) {
    nextWeek = null;
  }

  return (
    <div className={"flex flex-col items-center gap-2"}>
      <WeekSwitcher
        previousWeek={previousWeek}
        picksLeagueId={dbPicksLeague.id}
        selectedDBWeek={selectedDBWeek}
        nextWeek={nextWeek}
        tab={PicksLeagueTabIds.LEAGUE_PICKS}
      />

      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>League Picks</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {picksLocked && (
            <span>
              League Picks cannot be viewed until after pick lock time{" "}
              <DateDisplay
                timestampMS={selectedDBWeek.pickLockTime.getTime()}
              />
            </span>
          )}

          {!picksLocked && pickData.length === 0 && (
            <span>No picks for this week.</span>
          )}

          {!picksLocked &&
            pickData.map((data, index) => (
              <UserPicks
                key={data.id}
                data={data}
                pickType={dbPicksLeague.pickType}
                oddEven={index % 2 === 0 ? "even" : "odd"}
              />
            ))}
        </CardContent>
      </Card>
    </div>
  );
}

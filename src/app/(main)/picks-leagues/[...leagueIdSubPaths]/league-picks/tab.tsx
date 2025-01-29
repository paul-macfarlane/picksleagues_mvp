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
import { PicksLeaguePickTypes, PicksLeagueTabIds } from "@/models/picksLeagues";
import { getDBSportLeagueWeekById } from "@/db/sportLeagues";
import { getPrevAndNextDBWeekForPicksLeague } from "@/services/sportLeagueWeeks";
import { UserPicks } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/league-picks/user-picks";
import { WeekSwitcher } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/WeekSwitcher";
import { DateDisplay } from "@/components/date-display";

export interface LeaguePicksTabProps {
  picksLeagueId: string;
  sportsLeagueId: string;
  userId: string;
  weekId: string | null;
}

export async function LeaguePicksTab({
  picksLeagueId,
  sportsLeagueId,
  userId,
  weekId,
}: LeaguePicksTabProps) {
  let selectedDBWeek: DBSportLeagueWeek | null;
  const currentDBWeek = await getCurrentDBSportLeagueWeek(sportsLeagueId);
  if (weekId) {
    selectedDBWeek = await getDBSportLeagueWeekById(weekId);
  } else {
    selectedDBWeek = currentDBWeek;
  }
  if (!selectedDBWeek || !currentDBWeek) {
    return (
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>My Picks</CardTitle>
          <CardDescription>
            It is the off season. There are no picks to view.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const now = new Date();
  const picksLocked =
    selectedDBWeek.id === currentDBWeek.id && now < currentDBWeek.pickLockTime;
  let pickData: DBWeeklyPickDataByUser[] = [];
  if (!picksLocked) {
    pickData = await getLeagueDBWeeklyPickDataByUser(
      picksLeagueId,
      selectedDBWeek.id,
    );

    // move the current user's pick to the front
    const indexOfUser = pickData.findIndex((data) => data.id === userId);
    if (indexOfUser > -1) {
      const userPickData = pickData[indexOfUser];
      pickData.splice(indexOfUser, 1);
      pickData.unshift(userPickData);
    }
  }

  const { previousWeek, nextWeek } = await getPrevAndNextDBWeekForPicksLeague(
    picksLeagueId,
    selectedDBWeek.id,
  );

  return (
    <div className={"flex flex-col items-center gap-2"}>
      <WeekSwitcher
        previousWeek={previousWeek}
        picksLeagueId={picksLeagueId}
        selectedDBWeek={selectedDBWeek}
        nextWeek={nextWeek}
        tab={PicksLeagueTabIds.LEAGUE_PICKS}
      />

      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>League Picks</CardTitle>
          <span>View picks across the league for {selectedDBWeek.name}.</span>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {picksLocked && (
            <span>
              League Picks cannot be viewed until after pick lock time{" "}
              <DateDisplay timestampMS={currentDBWeek.pickLockTime.getTime()} />
            </span>
          )}

          {!picksLocked && pickData.length === 0 && (
            <span>No picks for this week.</span>
          )}

          {!picksLocked &&
            pickData.map((data) => (
              <UserPicks
                key={data.id}
                data={data}
                pickType={PicksLeaguePickTypes.AGAINST_THE_SPREAD}
              />
            ))}
        </CardContent>
      </Card>
    </div>
  );
}

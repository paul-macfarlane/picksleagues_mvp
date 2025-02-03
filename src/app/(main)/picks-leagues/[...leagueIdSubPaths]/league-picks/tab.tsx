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
import { getPrevAndNextDBWeekForPicksLeagueSeason } from "@/services/sportLeagueWeeks";
import { UserPicks } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/league-picks/user-picks";
import { WeekSwitcher } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/WeekSwitcher";
import { DateDisplay } from "@/components/date-display";
import {
  getActiveDBPicksLeagueSeason,
  getNextDBPicksLeagueSeason,
  getPreviousDBPicksLeagueSeason,
} from "@/db/picksLeagueSeasons";
import {
  DBSportLeagueSeason,
  getDBSportLeagueSeasonById,
} from "@/db/sportLeagueSeason";

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
  let currentOrNextSeason = "current";
  let dbPicksLeagueSeason = await getActiveDBPicksLeagueSeason(picksLeagueId);
  if (!dbPicksLeagueSeason) {
    currentOrNextSeason = "next";
    dbPicksLeagueSeason = await getPreviousDBPicksLeagueSeason(picksLeagueId);
  }

  if (!dbPicksLeagueSeason) {
    dbPicksLeagueSeason = await getNextDBPicksLeagueSeason(picksLeagueId);
    let dbSportLeagueSeason: DBSportLeagueSeason | null = null;
    let dbSportLeagueStartWeek: DBSportLeagueWeek | null = null;
    if (dbPicksLeagueSeason) {
      dbSportLeagueSeason = await getDBSportLeagueSeasonById(
        dbPicksLeagueSeason.sportLeagueSeasonId,
      );
      dbSportLeagueStartWeek = await getDBSportLeagueWeekById(
        dbPicksLeagueSeason.startSportLeagueWeekId,
      );
    }

    return (
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>
            League Picks{" "}
            {dbSportLeagueSeason && <>({dbSportLeagueSeason.name} season)</>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          There are no picks to view now.{" "}
          {dbSportLeagueStartWeek && (
            <>
              Wait until the season starts at{" "}
              <DateDisplay
                timestampMS={dbSportLeagueStartWeek.startTime.getTime()}
              />
            </>
          )}{" "}
          to view picks.
        </CardContent>
      </Card>
    );
  }

  let selectedDBWeek: DBSportLeagueWeek | null;
  if (weekId) {
    selectedDBWeek = await getDBSportLeagueWeekById(weekId);
    if (
      !selectedDBWeek ||
      selectedDBWeek.seasonId !== dbPicksLeagueSeason?.sportLeagueSeasonId
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
  } else if (currentOrNextSeason === "current") {
    selectedDBWeek = await getCurrentDBSportLeagueWeek(sportsLeagueId);
  } else {
    // get last week from previous season
    selectedDBWeek = await getDBSportLeagueWeekById(
      dbPicksLeagueSeason.endSportLeagueWeekId,
    );
  }

  const dbSportLeagueSeason = await getDBSportLeagueSeasonById(
    dbPicksLeagueSeason.sportLeagueSeasonId,
  );
  if (!selectedDBWeek || !dbSportLeagueSeason) {
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

  const { previousWeek, nextWeek } =
    await getPrevAndNextDBWeekForPicksLeagueSeason(
      dbPicksLeagueSeason.id,
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
          <CardTitle>
            League Picks ({dbSportLeagueSeason.name} season)
          </CardTitle>
          <span>View picks across the league for {selectedDBWeek.name}.</span>
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

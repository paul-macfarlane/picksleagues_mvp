import { PicksLeagueMyPicksForm } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/my-picks/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PicksLeaguePickStatuses,
  getGamePickStatus,
} from "@/shared/picksLeaguePicks";
import {
  DBSportLeagueWeek,
  DBWeeklyPickDataByUserGame,
  getCurrentDBSportLeagueWeek,
  getUserDBWeeklyPickData,
} from "@/db/sportLeagueWeeks";
import { SportLeagueGameStatuses } from "@/models/sportLeagueGames";
import { PicksLeagueGameBox } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/GameBox";
import { PicksLeaguePickTypes, PicksLeagueTabIds } from "@/models/picksLeagues";
import { getDBSportLeagueWeekById } from "@/db/sportLeagues";
import { getPrevAndNextDBWeekForPicksLeagueSeason } from "@/services/sportLeagueWeeks";
import { WeekSwitcher } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/WeekSwitcher";
import { DateDisplay } from "@/components/date-display";
import {
  getActiveDBPicksLeagueSeason,
  getNextDBPicksLeagueSeason,
  getPreviousDBPicksLeagueSeason,
} from "@/db/picksLeagueSeasons";

export interface PicksLeagueMyPicksTabProps {
  picksLeagueId: string;
  sportsLeagueId: string;
  picksPerWeek: number;
  userId: string;
  pickType: PicksLeaguePickTypes;
  weekId: string | null;
}

export async function PicksLeagueMyPicksTab({
  picksLeagueId,
  sportsLeagueId,
  picksPerWeek,
  userId,
  pickType,
  weekId,
}: PicksLeagueMyPicksTabProps) {
  let currentOrNextSeason = "current";
  let dbPicksLeagueSeason = await getActiveDBPicksLeagueSeason(picksLeagueId);
  if (!dbPicksLeagueSeason) {
    currentOrNextSeason = "next";
    dbPicksLeagueSeason = await getPreviousDBPicksLeagueSeason(picksLeagueId);
  }

  if (!dbPicksLeagueSeason) {
    dbPicksLeagueSeason = await getNextDBPicksLeagueSeason(picksLeagueId);
    let dbSportLeagueStartWeek: DBSportLeagueWeek | null = null;
    if (dbPicksLeagueSeason) {
      dbSportLeagueStartWeek = await getDBSportLeagueWeekById(
        dbPicksLeagueSeason.startSportLeagueWeekId,
      );
    }

    return (
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>My Picks</CardTitle>
        </CardHeader>
        <CardContent>
          There are no picks to view or make right now.{" "}
          {dbSportLeagueStartWeek && (
            <>
              Wait until the season starts at{" "}
              <DateDisplay
                timestampMS={dbSportLeagueStartWeek.startTime.getTime()}
              />
            </>
          )}{" "}
          to make picks.
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

  const picksData = await getUserDBWeeklyPickData(
    picksLeagueId,
    selectedDBWeek.id,
    userId,
  );
  const picksMade =
    picksData?.games.findIndex((game) => !!game.userPick) !== -1;
  if (picksMade && picksData) {
    picksData.games = picksData.games.filter((game) => !!game.userPick);
  } else if (picksData) {
    const now = new Date();
    picksData.games = picksData.games.filter((game) => game.startTime > now);
  }

  const requiredAmountOfPicks = Math.min(
    picksPerWeek,
    picksData?.games.length ?? 0,
  );

  const correctPickCount =
    picksData?.games.filter(
      (game) =>
        getGamePickStatus(game, game.userPick) === PicksLeaguePickStatuses.WIN,
    ).length ?? 0;
  const gamesComplete =
    picksData?.games.filter(
      (game) => game.status === SportLeagueGameStatuses.FINAL,
    ).length ?? 0;
  const gamesYetToPlay =
    picksData?.games.filter((game) => game.period === 0).length ?? 0;
  const gamesInProgress =
    picksData?.games.filter(
      (game) =>
        game.status !== SportLeagueGameStatuses.FINAL && game.period > 0,
    ).length ?? 0;

  let { previousWeek, nextWeek } =
    await getPrevAndNextDBWeekForPicksLeagueSeason(
      dbPicksLeagueSeason.id,
      selectedDBWeek.id,
    );
  const now = new Date();
  const activeWeekIsSelectedWeek =
    selectedDBWeek.startTime <= now && selectedDBWeek.endTime >= now;
  if (activeWeekIsSelectedWeek) {
    nextWeek = null;
  }

  return (
    <div className={"flex flex-col items-center gap-2"}>
      <WeekSwitcher
        previousWeek={previousWeek}
        picksLeagueId={picksLeagueId}
        selectedDBWeek={selectedDBWeek}
        nextWeek={nextWeek}
        tab={PicksLeagueTabIds.MY_PICKS}
      />

      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>My Picks</CardTitle>

          {!picksData && (
            <span>
              There are no games available to pick for {selectedDBWeek.name}.
            </span>
          )}

          {picksMade && picksData && (
            <span>View your picks for {selectedDBWeek.name}.</span>
          )}

          {!picksMade && picksData.games.length > 0 && (
            <div className="flex flex-col gap-2">
              <span>Make your picks for this week&#39;s games.</span>

              <ul className={"list-inside list-disc space-y-1 text-sm"}>
                <li>
                  You can make picks for games that have not started yet up
                  until the pick lock time of{" "}
                  <DateDisplay
                    timestampMS={selectedDBWeek.pickLockTime.getTime()}
                  />
                </li>
                <li>
                  You can only make picks for games that have not started yet.
                </li>
                <li>You must pick all games at once.</li>
                <li>You cannot change your picks once they are made.</li>
                <li>Good luck!</li>
              </ul>
            </div>
          )}
        </CardHeader>

        {!picksMade && picksData.games.length === 0 && (
          <CardContent>
            <span>
              There are no more picks that can be made for {selectedDBWeek.name}
              .
            </span>
          </CardContent>
        )}

        {!picksMade && picksData.games.length > 0 && (
          <PicksLeagueMyPicksForm
            picksLeagueId={picksLeagueId}
            requiredAmountOfPicks={requiredAmountOfPicks}
            games={picksData.games}
            pickType={pickType}
          />
        )}

        {picksMade && picksData && (
          <PicksList
            games={picksData.games.map((game) => ({
              ...game,
              userPick: game.userPick!,
            }))}
            correctPickCount={correctPickCount}
            gamesComplete={gamesComplete}
            gamesInProgress={gamesInProgress}
            gamesYetToPlay={gamesYetToPlay}
            pickType={pickType}
          />
        )}
      </Card>
    </div>
  );
}

interface PicksListProps {
  games: DBWeeklyPickDataByUserGame[];
  correctPickCount: number;
  gamesComplete: number;
  gamesInProgress: number;
  gamesYetToPlay: number;
  pickType: PicksLeaguePickTypes;
}

function PicksList({
  games,
  correctPickCount,
  gamesComplete,
  gamesInProgress,
  gamesYetToPlay,
  pickType,
}: PicksListProps) {
  return (
    <CardContent className={"space-y-4"}>
      <ul className="list-inside list-disc">
        <li>
          {correctPickCount}/{gamesComplete} Picks Correct
        </li>
        <li>{gamesInProgress} In Progress</li>
        <li>{gamesYetToPlay} Yet to Play</li>
      </ul>

      {games.map((game) => (
        <PicksLeagueGameBox key={game.id} game={game} pickType={pickType} />
      ))}
    </CardContent>
  );
}

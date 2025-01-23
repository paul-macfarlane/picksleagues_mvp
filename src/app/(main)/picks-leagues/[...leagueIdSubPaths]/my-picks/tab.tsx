import { PicksLeagueMyPicksForm } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/my-picks/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GamePickStatuses, getGamePickStatus } from "@/shared/picksLeaguePicks";
import {
  DBSportLeagueWeek,
  DBWeeklyPickDataByUserGame,
  getCurrentDBSportLeagueWeek,
  getUserDBWeeklyPickData,
} from "@/db/sportLeagueWeeks";
import { SportLeagueGameStatuses } from "@/models/sportLeagueGames";
import { PicksLeagueGameBox } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/GameBox";
import { PicksLeaguePickTypes } from "@/models/picksLeagues";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { getDBSportLeagueWeekById } from "@/db/sportLeagues";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPrevAndNextDBWeekForPicksLeague } from "@/services/sportLeagueWeeks";

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
  let selectedDBWeek: DBSportLeagueWeek | null = null;
  if (weekId) {
    selectedDBWeek = await getDBSportLeagueWeekById(weekId);
  } else {
    selectedDBWeek = await getCurrentDBSportLeagueWeek(sportsLeagueId);
  }
  if (!selectedDBWeek) {
    return (
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>My Picks</CardTitle>
          <CardDescription>
            It is the off season. There are no picks to make.
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
      (game) => getGamePickStatus(game, game.userPick) === GamePickStatuses.WIN,
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

  const { previousWeek, nextWeek } = await getPrevAndNextDBWeekForPicksLeague(
    picksLeagueId,
    selectedDBWeek.id,
  );

  return (
    <div className={"flex flex-col items-center gap-2"}>
      <div className={"mx-auto flex w-full max-w-4xl justify-center"}>
        <Pagination>
          <PaginationContent>
            {previousWeek && (
              <PaginationItem>
                <PaginationLink
                  className={"w-full p-2 md:p-4"}
                  href={`/picks-leagues/${picksLeagueId}/my-picks?weekId=${previousWeek.id}`}
                >
                  <ChevronLeft /> {previousWeek.name}
                </PaginationLink>
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationLink
                isActive
                className={"w-full p-2 md:p-4"}
                href={`/picks-leagues/${picksLeagueId}/my-picks?weekId=${selectedDBWeek.id}`}
              >
                {selectedDBWeek.name}
              </PaginationLink>
            </PaginationItem>

            {nextWeek && (
              <PaginationItem>
                <PaginationLink
                  className={"w-full p-2 md:p-4"}
                  href={`/picks-leagues/${picksLeagueId}/my-picks?weekId=${nextWeek.id}`}
                >
                  {nextWeek.name} <ChevronRight />
                </PaginationLink>
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      </div>

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

          {!picksMade && picksData && (
            <div className="flex flex-col gap-2">
              <span>Make your picks for this week&#39;s games.</span>

              <ul className={"list-inside list-disc space-y-1 text-sm"}>
                <li>You can make picks for games that have not started yet.</li>
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
            <span>There are no more picks that can be made this week.</span>
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

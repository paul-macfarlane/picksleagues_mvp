import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DBSportLeagueWeek,
  getCurrentDBSportLeagueWeek,
  getLeagueDBWeeklyPickDataByUser,
} from "@/db/sportLeagueWeeks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { GamePickStatuses, getGamePickStatus } from "@/shared/picksLeaguePicks";
import { SportLeagueGameStatuses } from "@/models/sportLeagueGames";
import { PicksLeagueGameBox } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/GameBox";
import { PicksLeaguePickTypes } from "@/models/picksLeagues";
import { getDBSportLeagueWeekById } from "@/db/sportLeagues";
import { getPrevAndNextDBWeekForPicksLeague } from "@/services/sportLeagueWeeks";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface LeaguePicksTabProps {
  picksLeagueId: string;
  sportsLeagueId: string;
  userId: string;
  pickType: PicksLeaguePickTypes;
  weekId: string | null;
}

export async function LeaguePicksTab({
  picksLeagueId,
  sportsLeagueId,
  userId,
  pickType,
  weekId,
}: LeaguePicksTabProps) {
  let selectedDBWeek: DBSportLeagueWeek | null;
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
            It is the off season. There are no picks to view.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  let pickData = await getLeagueDBWeeklyPickDataByUser(
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

  const { previousWeek, nextWeek } = await getPrevAndNextDBWeekForPicksLeague(
    picksLeagueId,
    selectedDBWeek.id,
  );

  // todo might want to make picks collapsable, or make carousel of user picks

  return (
    <div className={"flex flex-col items-center gap-2"}>
      <div className={"mx-auto flex w-full max-w-4xl justify-center"}>
        <Pagination>
          <PaginationContent>
            {previousWeek && (
              <PaginationItem>
                <PaginationLink
                  className={"w-full p-2 md:p-4"}
                  href={`/picks-leagues/${picksLeagueId}/league-picks?weekId=${previousWeek.id}`}
                >
                  <ChevronLeft /> {previousWeek.name}
                </PaginationLink>
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationLink
                isActive
                className={"w-full p-2 md:p-4"}
                href={`/picks-leagues/${picksLeagueId}/league-picks?weekId=${selectedDBWeek.id}`}
              >
                {selectedDBWeek.name}
              </PaginationLink>
            </PaginationItem>

            {nextWeek && (
              <PaginationItem>
                <PaginationLink
                  className={"w-full p-2 md:p-4"}
                  href={`/picks-leagues/${picksLeagueId}/league-picks?weekId=${nextWeek.id}`}
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
          <CardTitle>League Picks</CardTitle>
          <span>View picks across the league for {selectedDBWeek.name}.</span>
        </CardHeader>

        <CardContent className="flex flex-col gap-2 md:gap-4">
          {pickData.length === 0 && <span>No picks for this week.</span>}

          {pickData.map((data) => {
            const gamesCorrect = data.games.filter(
              (game) =>
                getGamePickStatus(game, game.userPick) === GamePickStatuses.WIN,
            ).length;
            const gamesInProgress = data.games.filter(
              (game) =>
                game.status !== SportLeagueGameStatuses.FINAL &&
                game.period > 0,
            ).length;
            const gamesCompleted = data.games.filter(
              (game) => game.status === SportLeagueGameStatuses.FINAL,
            ).length;
            const gamesYetToPlay = data.games.filter(
              (game) => game.period === 0,
            ).length;

            return (
              <div
                key={data.id}
                className="flex flex-col gap-2 space-y-2 rounded border p-2 md:gap-4 md:p-4"
              >
                <div
                  className={
                    "flex flex-col gap-2 p-2 md:flex-row md:items-center md:justify-between"
                  }
                >
                  <div className="flex gap-2 md:flex-row md:items-center">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={data.image ?? ""}
                        alt={data.username!}
                      />
                      <AvatarFallback>
                        {data.username!.charAt(0).toLocaleUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {data.username} ({`${data.firstName} ${data.lastName}`})
                  </div>

                  <ul className="list-inside list-disc md:hidden">
                    <li>
                      {gamesCorrect}/{gamesCompleted} Correct
                    </li>
                    <li>{gamesInProgress} In Progress</li>
                    <li>{gamesYetToPlay} Yet to Play</li>
                  </ul>

                  <div className="hidden md:block">
                    <span>
                      {gamesCorrect}/{gamesCompleted} Correct
                    </span>
                    {" • "}
                    <span>{gamesInProgress} In Progress</span>
                    {" • "}
                    <span>{gamesYetToPlay} Yet to Play</span>
                  </div>
                </div>

                <Separator />

                {data.games.map((game) => (
                  <PicksLeagueGameBox
                    key={game.id}
                    game={game}
                    pickType={pickType}
                  />
                ))}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

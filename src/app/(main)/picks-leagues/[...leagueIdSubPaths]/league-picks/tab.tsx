import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getCurrentDBSportLeagueWeek,
  getLeagueDBWeeklyPickDataByUser,
} from "@/db/sportLeagueWeeks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { GamePickStatuses, getGamePickStatus } from "@/shared/picksLeaguePicks";
import { SportLeagueGameStatuses } from "@/models/sportLeagueGames";
import { PicksLeagueGameBox } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/GameBox";
import { PicksLeaguePickTypes } from "@/models/picksLeagues";

export interface LeaguePicksTabProps {
  picksLeagueId: string;
  sportsLeagueId: string;
  userId: string;
  pickType: PicksLeaguePickTypes;
}

export async function LeaguePicksTab({
  picksLeagueId,
  sportsLeagueId,
  userId,
  pickType,
}: LeaguePicksTabProps) {
  // todo also allow for week id to come from query params, default to current week
  const currentDBWeek = await getCurrentDBSportLeagueWeek(sportsLeagueId);
  if (!currentDBWeek) {
    return (
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>No Pick Data</CardTitle>
          <CardDescription>
            There are no picks to view this week.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  let pickData = await getLeagueDBWeeklyPickDataByUser(picksLeagueId);

  // move the current user's pick to the front
  const indexOfUser = pickData.findIndex((data) => data.id === userId);
  if (indexOfUser > -1) {
    const userPickData = pickData[indexOfUser];
    pickData.splice(indexOfUser, 1);
    pickData.unshift(userPickData);
  }

  // todo need the ability to toggle between current and previous weeks at some point
  // todo also might want to make picks collapsable, or make carousel of user picks

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle>{currentDBWeek.name} Picks</CardTitle>
        <span>View picks across the league for this week.</span>
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
              game.status !== SportLeagueGameStatuses.FINAL && game.period > 0,
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
                    <AvatarImage src={data.image ?? ""} alt={data.username!} />
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
  );
}

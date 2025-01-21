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
import { DBPicksLeague } from "@/db/picksLeagues";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  GamePickStatuses,
  getGamePickStatus,
  getGamePickTimeDisplay,
} from "@/shared/picksLeaguePicks";
import { Badge } from "@/components/ui/badge";
import { Fragment } from "react";
import { SportLeagueGameStatuses } from "@/models/sportLeagueGames";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export interface LeaguePicksTabProps {
  dbPicksLeague: DBPicksLeague;
}

export async function LeaguePicksTab({ dbPicksLeague }: LeaguePicksTabProps) {
  const session = await auth();
  if (!session?.user?.id) {
    return redirect("/auth");
  }

  const currentDBWeek = await getCurrentDBSportLeagueWeek(
    dbPicksLeague.sportLeagueId,
  );
  if (!currentDBWeek) {
    return (
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>No Week Data</CardTitle>
          <CardDescription>
            There are no picks to view this week.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  let pickData = await getLeagueDBWeeklyPickDataByUser(dbPicksLeague.id);

  // move user's pick to the front
  const indexOfUser = pickData.findIndex(
    (data) => data.id === session.user?.id,
  );
  if (indexOfUser > -1) {
    const userPickData = pickData[indexOfUser];
    pickData.splice(indexOfUser, 1);
    pickData.unshift(userPickData);
  }

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle>{currentDBWeek.name} Picks</CardTitle>
        <CardDescription>
          View picks across the league for this week.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-2 md:gap-4">
        {pickData.map((data) => {
          const amountCorrect = data.games.filter(
            (game) =>
              getGamePickStatus(game, game.userPick) === GamePickStatuses.WIN,
          ).length;

          const amountCompleted = data.games.filter(
            (game) => game.status === SportLeagueGameStatuses.FINAL,
          ).length;

          const amountRemaining = data.games.length - amountCompleted;

          return (
            <div
              key={data.id}
              className="space-y-2 rounded border p-2 md:space-y-4 md:p-4"
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

                <div className="p-2">
                  <span>
                    {amountCorrect}/{amountCompleted} Picks Correct
                  </span>
                  {" - "}
                  <span>{amountRemaining} Remaining</span>
                </div>
              </div>

              <Separator />

              {data.games.map((game) => {
                const gamePickStatus = getGamePickStatus(game, game.userPick);
                let gameBorder = "";
                let indicatorText = "";
                let indicatorVariant:
                  | "default"
                  | "destructive"
                  | "caution"
                  | "blue"
                  | undefined;
                switch (gamePickStatus) {
                  case GamePickStatuses.WIN:
                    gameBorder = "border-primary";
                    indicatorText = GamePickStatuses.WIN;
                    indicatorVariant = "default";
                    break;
                  case GamePickStatuses.LOSS:
                    gameBorder = "border-destructive";
                    indicatorText = GamePickStatuses.LOSS;
                    indicatorVariant = "destructive";
                    break;
                  case GamePickStatuses.PUSH:
                    gameBorder = "border-yellow-400";
                    indicatorText = GamePickStatuses.PUSH;
                    indicatorVariant = "caution";
                    break;
                  case GamePickStatuses.PICKED:
                    gameBorder = "border-yellow-400";
                    indicatorText = GamePickStatuses.PICKED;
                    indicatorVariant = "blue";
                    break;
                  default:
                    break;
                }

                const pickLocation =
                  game.userPick.teamId === game.homeTeamId ? "HOME" : "AWAY";

                // todo should add ability to carousel between users instead of viewing them all in a long list

                return (
                  <Fragment key={game.id}>
                    <div
                      className={`hidden rounded border p-2 md:flex md:flex-col`}
                    >
                      <div className={"flex items-center justify-between p-2"}>
                        <Badge variant={indicatorVariant}>
                          {indicatorText}
                        </Badge>

                        <span>{getGamePickTimeDisplay(game)}</span>
                      </div>

                      <div
                        className={
                          "flex items-center justify-between gap-4 p-2"
                        }
                      >
                        <div
                          className={`flex flex-1 items-center justify-between rounded border px-2 md:px-4 ${pickLocation === "AWAY" ? `${gameBorder} bg-accent font-bold` : ""}`}
                        >
                          <div className="flex items-center gap-1 md:gap-2">
                            {game.period > 0 && (
                              <span>{game.awayTeamScore}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 p-2 md:gap-2">
                            <span>
                              {game.awayTeam.abbreviation}{" "}
                              {`${game.userPick.teamId === game.awayTeamId ? (game.userPick.favorite ? "-" : "+") : game.userPick.favorite ? "+" : "-"}${game.userPick.spread}`}
                            </span>
                            <Image
                              src={game.awayTeam.logoUrl!}
                              alt={`${game.awayTeam.name} logo`}
                              width={32}
                              height={32}
                            />
                          </div>
                        </div>

                        <span>@</span>

                        <div
                          className={`flex flex-1 items-center justify-between rounded border px-2 md:px-4 ${pickLocation === "HOME" ? `${gameBorder} bg-accent font-bold` : ""}`}
                        >
                          <div className="flex items-center gap-1 p-2 md:gap-2">
                            <Image
                              src={game.homeTeam.logoUrl!}
                              alt={`${game.homeTeam.name} logo`}
                              width={32}
                              height={32}
                            />
                            <span>
                              {game.homeTeam.abbreviation}{" "}
                              {`${game.userPick.teamId === game.homeTeamId ? (game.userPick.favorite ? "-" : "+") : game.userPick.favorite ? "+" : "-"}${game.userPick.spread}`}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 md:gap-2">
                            {game.period > 0 && (
                              <span>{game.homeTeamScore}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 rounded border p-2 md:hidden">
                      <div className={"flex items-center justify-between p-2"}>
                        <Badge variant={indicatorVariant}>
                          {indicatorText}
                        </Badge>

                        <span>
                          {game.awayTeam.abbreviation} @{" "}
                          {game.homeTeam.abbreviation}
                        </span>

                        <span className="text-sm">
                          {getGamePickTimeDisplay(game)}
                        </span>
                      </div>

                      <div
                        className={`flex items-center justify-between rounded border p-4 ${pickLocation === "AWAY" ? `font-bold ${gameBorder} bg-accent` : ""}`}
                      >
                        <div className="flex items-center gap-4">
                          <Image
                            src={game.awayTeam.logoUrl ?? ""}
                            alt={`${game.awayTeam.name} logo`}
                            width={32}
                            height={32}
                          />
                          <span>{game.awayTeam.abbreviation}</span>
                        </div>

                        <span>{game.awayTeamScore}</span>
                      </div>
                      <div
                        className={`flex items-center justify-between rounded border p-4 ${pickLocation === "HOME" ? `font-bold ${gameBorder} bg-accent` : ""}`}
                      >
                        <div className="flex items-center gap-4">
                          <Image
                            src={game.homeTeam.logoUrl ?? ""}
                            alt={`${game.homeTeam.name} logo`}
                            width={32}
                            height={32}
                          />
                          <span>{game.homeTeam.abbreviation}</span>
                        </div>

                        <span>{game.homeTeamScore}</span>
                      </div>
                    </div>
                  </Fragment>
                );
              })}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

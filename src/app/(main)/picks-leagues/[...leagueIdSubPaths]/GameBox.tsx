import { DBWeeklyPickDataByUserGame } from "@/db/sportLeagueWeeks";
import {
  PicksLeaguePickStatuses,
  getGamePickStatus,
} from "@/shared/picksLeaguePicks";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { PicksLeaguePickTypes } from "@/models/picksLeagues";
import { GamePickTimeDisplay } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/GamePickTimeDisplay";

export interface PicksLeagueGameBoxProps {
  game: DBWeeklyPickDataByUserGame;
  pickType: PicksLeaguePickTypes;
  oddEven: "odd" | "even";
}

export function PicksLeagueGameBox({
  game,
  pickType,
  oddEven,
}: PicksLeagueGameBoxProps) {
  const gamePickStatus = getGamePickStatus(game, game.userPick);
  let gameBorder = "";
  let indicatorText = "";
  let indicatorVariant:
    | "success"
    | "destructive"
    | "warning"
    | "neutral-blue"
    | undefined;
  switch (gamePickStatus) {
    case PicksLeaguePickStatuses.WIN:
      gameBorder = "border-success";
      indicatorText = PicksLeaguePickStatuses.WIN;
      indicatorVariant = "success";
      break;
    case PicksLeaguePickStatuses.LOSS:
      gameBorder = "border-destructive";
      indicatorText = PicksLeaguePickStatuses.LOSS;
      indicatorVariant = "destructive";
      break;
    case PicksLeaguePickStatuses.PUSH:
      gameBorder = "border-warning";
      indicatorText = PicksLeaguePickStatuses.PUSH;
      indicatorVariant = "warning";
      break;
    case PicksLeaguePickStatuses.PICKED:
      gameBorder = "border-neutral-blue";
      indicatorText = PicksLeaguePickStatuses.PICKED;
      indicatorVariant = "neutral-blue";
      break;
    default:
      break;
  }

  const pickLocation =
    game.userPick.teamId === game.homeTeamId ? "HOME" : "AWAY";

  return (
    <>
      <div
        className={`hidden rounded border p-2 shadow-md md:flex md:flex-col ${oddEven === "odd" ? "bg-muted/30" : "bg-card"}`}
      >
        <div className="relative flex items-center justify-between p-2">
          <div className="flex-shrink-0">
            <Badge variant={indicatorVariant}>{indicatorText}</Badge>
          </div>

          <span className="absolute left-1/2 -translate-x-1/2 transform font-bold">
            {game.awayTeam.abbreviation} @ {game.homeTeam.abbreviation}
          </span>

          <div className="flex-shrink-0">
            <GamePickTimeDisplay game={game} />
          </div>
        </div>

        <div className={"flex items-center justify-between gap-4 p-2"}>
          <div
            className={`flex flex-1 items-center justify-between rounded border px-4 ${pickLocation === "AWAY" ? `${gameBorder} bg-accent font-bold` : ""}`}
          >
            <div className="flex items-center gap-2">
              {game.period > 0 && <span>{game.awayTeamScore}</span>}
            </div>

            <div className="flex items-center gap-2 p-2">
              <span>
                {game.awayTeam.abbreviation}{" "}
                {pickType === PicksLeaguePickTypes.AGAINST_THE_SPREAD
                  ? `${game.userPick.teamId === game.awayTeamId ? (game.userPick.favorite ? "-" : "+") : game.userPick.favorite ? "+" : "-"}${game.userPick.spread}`
                  : ""}
              </span>
              <Image
                src={game.awayTeam.logoUrl!}
                alt={`${game.awayTeam.name} logo`}
                width={32}
                height={32}
              />
            </div>
          </div>

          <div
            className={`flex flex-1 items-center justify-between rounded border px-4 ${pickLocation === "HOME" ? `${gameBorder} bg-accent font-bold` : ""}`}
          >
            <div className="flex items-center gap-2 p-2">
              <Image
                src={game.homeTeam.logoUrl!}
                alt={`${game.homeTeam.name} logo`}
                width={32}
                height={32}
              />
              <span>
                {game.homeTeam.abbreviation}{" "}
                {pickType === PicksLeaguePickTypes.AGAINST_THE_SPREAD
                  ? `${game.userPick.teamId === game.homeTeamId ? (game.userPick.favorite ? "-" : "+") : game.userPick.favorite ? "+" : "-"}${game.userPick.spread}`
                  : ""}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {game.period > 0 && <span>{game.homeTeamScore}</span>}
            </div>
          </div>
        </div>

        {pickType === PicksLeaguePickTypes.AGAINST_THE_SPREAD && (
          <div className="pr-2 text-right">
            <p className="text-sm text-muted-foreground">
              Odds presented by{" "}
              <span className="italic">{game.oddsProvider.name}</span>
            </p>
          </div>
        )}
      </div>

      <div
        className={`flex flex-col gap-2 rounded border p-2 shadow-md md:hidden ${oddEven === "odd" ? "bg-muted/30" : "bg-card"}`}
      >
        <div className={"flex items-center justify-between p-2 text-sm"}>
          <Badge variant={indicatorVariant}>{indicatorText}</Badge>

          <span className="font-bold">
            {game.awayTeam.abbreviation} @ {game.homeTeam.abbreviation}
          </span>

          <span>
            <GamePickTimeDisplay game={game} />
          </span>
        </div>

        <div
          className={`flex items-center justify-between rounded border p-2 ${pickLocation === "AWAY" ? `font-bold ${gameBorder} bg-accent` : ""}`}
        >
          <div className="flex items-center gap-2">
            <Image
              src={game.awayTeam.logoUrl ?? ""}
              alt={`${game.awayTeam.name} logo`}
              width={32}
              height={32}
            />
            <span>
              {game.awayTeam.abbreviation}{" "}
              {pickType === PicksLeaguePickTypes.AGAINST_THE_SPREAD
                ? `${game.userPick.teamId === game.awayTeamId ? (game.userPick.favorite ? "-" : "+") : game.userPick.favorite ? "+" : "-"}${game.userPick.spread}`
                : ""}
            </span>
          </div>

          <span>{game.awayTeamScore}</span>
        </div>
        <div
          className={`flex items-center justify-between rounded border p-2 ${pickLocation === "HOME" ? `font-bold ${gameBorder} bg-accent` : ""}`}
        >
          <div className="flex items-center gap-2">
            <Image
              src={game.homeTeam.logoUrl ?? ""}
              alt={`${game.homeTeam.name} logo`}
              width={32}
              height={32}
            />
            <span>
              {game.homeTeam.abbreviation}{" "}
              {pickType === PicksLeaguePickTypes.AGAINST_THE_SPREAD
                ? `${game.userPick.teamId === game.homeTeamId ? (game.userPick.favorite ? "-" : "+") : game.userPick.favorite ? "+" : "-"}${game.userPick.spread}`
                : ""}
            </span>
          </div>

          <span>{game.homeTeamScore}</span>
        </div>

        {pickType === PicksLeaguePickTypes.AGAINST_THE_SPREAD && (
          <div className="pr-2 text-right">
            <p className="text-sm text-muted-foreground">
              Odds presented by{" "}
              <span className="italic">{game.oddsProvider.name}</span>
            </p>
          </div>
        )}
      </div>
    </>
  );
}

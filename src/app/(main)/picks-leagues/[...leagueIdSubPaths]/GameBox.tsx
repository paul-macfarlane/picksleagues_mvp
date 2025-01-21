import { DBWeeklyPickDataByUserGame } from "@/db/sportLeagueWeeks";
import {
  GamePickStatuses,
  getGamePickStatus,
  getGamePickTimeDisplay,
} from "@/shared/picksLeaguePicks";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export interface PicksLeagueGameBoxProps {
  game: DBWeeklyPickDataByUserGame;
}

export function PicksLeagueGameBox({ game }: PicksLeagueGameBoxProps) {
  const gamePickStatus = getGamePickStatus(game, game.userPick);
  let gameBorder = "";
  let indicatorText = "";
  let indicatorVariant:
    | "default"
    | "destructive"
    | "warning"
    | "neutral-blue"
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
      gameBorder = "border-warning";
      indicatorText = GamePickStatuses.PUSH;
      indicatorVariant = "warning";
      break;
    case GamePickStatuses.PICKED:
      gameBorder = "border-neutral-blue";
      indicatorText = GamePickStatuses.PICKED;
      indicatorVariant = "neutral-blue";
      break;
    default:
      break;
  }

  const pickLocation =
    game.userPick.teamId === game.homeTeamId ? "HOME" : "AWAY";

  // todo this right now assumes pick against the spread, maybe just remove pick types because who wants to pick straight up, or handle both pick types?

  return (
    <>
      <div className={`hidden rounded border p-2 md:flex md:flex-col`}>
        <div className={"flex items-center justify-between p-2"}>
          <Badge variant={indicatorVariant}>{indicatorText}</Badge>

          <span className="font-bold">
            {game.awayTeam.abbreviation} @ {game.homeTeam.abbreviation}
          </span>

          <span>{getGamePickTimeDisplay(game)}</span>
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
                {`${game.userPick.teamId === game.homeTeamId ? (game.userPick.favorite ? "-" : "+") : game.userPick.favorite ? "+" : "-"}${game.userPick.spread}`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {game.period > 0 && <span>{game.homeTeamScore}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded border p-2 md:hidden">
        <div className={"flex items-center justify-between p-2"}>
          <Badge variant={indicatorVariant}>{indicatorText}</Badge>

          <span>
            {game.awayTeam.abbreviation} @ {game.homeTeam.abbreviation}
          </span>

          <span className="text-sm">{getGamePickTimeDisplay(game)}</span>
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
              {`${game.userPick.teamId === game.awayTeamId ? (game.userPick.favorite ? "-" : "+") : game.userPick.favorite ? "+" : "-"}${game.userPick.spread}`}
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
              {`${game.userPick.teamId === game.homeTeamId ? (game.userPick.favorite ? "-" : "+") : game.userPick.favorite ? "+" : "-"}${game.userPick.spread}`}
            </span>
          </div>

          <span>{game.homeTeamScore}</span>
        </div>
      </div>
    </>
  );
}

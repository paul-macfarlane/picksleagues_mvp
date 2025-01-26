"use client";

import { GamePickStatuses, getGamePickStatus } from "@/shared/picksLeaguePicks";
import { SportLeagueGameStatuses } from "@/models/sportLeagueGames";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronsUpDown } from "lucide-react";
import { PicksLeagueGameBox } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/GameBox";
import { DBWeeklyPickDataByUser } from "@/db/sportLeagueWeeks";
import { PicksLeaguePickTypes } from "@/models/picksLeagues";
import { useState } from "react";

export interface UserPicksProps {
  data: DBWeeklyPickDataByUser;
  pickType: PicksLeaguePickTypes;
}

export function UserPicks({ data, pickType }: UserPicksProps) {
  const [picksOpen, setPicksOpen] = useState(false);

  const gamesCorrect = data.games.filter(
    (game) => getGamePickStatus(game, game.userPick) === GamePickStatuses.WIN,
  ).length;
  const gamesInProgress = data.games.filter(
    (game) => game.status !== SportLeagueGameStatuses.FINAL && game.period > 0,
  ).length;
  const gamesCompleted = data.games.filter(
    (game) => game.status === SportLeagueGameStatuses.FINAL,
  ).length;
  const gamesYetToPlay = data.games.filter((game) => game.period === 0).length;

  return (
    <div key={data.id} className="flex flex-col space-y-2 rounded border">
      <div
        className={
          "flex flex-col gap-2 p-4 md:flex-row md:items-center md:justify-between"
        }
      >
        <div className="flex gap-2 md:flex-row md:items-center">
          <Avatar className="h-8 w-8">
            <AvatarImage src={data.image ?? undefined} alt={data.username!} />
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

      <Collapsible className="!m-0 flex flex-col !p-0 md:gap-4">
        <CollapsibleTrigger
          className={
            "flex w-full items-center justify-center gap-2 rounded border bg-accent p-1 md:p-2"
          }
          onClick={() => setPicksOpen(!picksOpen)}
        >
          <ChevronsUpDown className="h-4 w-4" />
          {picksOpen ? "Hide Picks" : "Open Picks"}
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="flex flex-col gap-2">
            {data.games.map((game) => (
              <PicksLeagueGameBox
                key={game.id}
                game={game}
                pickType={pickType}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

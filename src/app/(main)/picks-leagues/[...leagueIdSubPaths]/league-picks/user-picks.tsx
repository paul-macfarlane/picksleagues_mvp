"use client";

import { getPointsEarnedAndRemainingFromUserPickData } from "@/shared/picksLeaguePicks";
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
  oddEven: "odd" | "even";
}

export function UserPicks({ data, pickType, oddEven }: UserPicksProps) {
  const [picksOpen, setPicksOpen] = useState(false);

  const { pointsEarned, pointsRemaining } =
    getPointsEarnedAndRemainingFromUserPickData(data);

  return (
    <div
      key={data.id}
      className={`flex flex-col space-y-2 rounded border ${oddEven === "odd" ? "bg-muted/30" : "bg-card"}`}
    >
      <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={data.image ?? undefined} alt={data.username!} />
            <AvatarFallback>
              {data.username!.charAt(0).toLocaleUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold">{data.username}</span>
            <span className="text-sm text-muted-foreground">{`${data.firstName} ${data.lastName}`}</span>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:gap-4">
          <div className="flex items-center gap-2">
            <span
              className={`text-lg font-bold ${pointsEarned > 0 && pointsRemaining === 0 ? "text-success" : "text-muted-foreground"}`}
            >
              {pointsEarned}
            </span>
            <span className="text-sm text-muted-foreground">points earned</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-lg font-bold ${pointsRemaining > 0 ? "text-success" : "text-muted-foreground"}`}
            >
              {pointsRemaining}
            </span>
            <span className="text-sm text-muted-foreground">
              points available
            </span>
          </div>
        </div>
      </div>

      <Collapsible className="!m-0 flex flex-col !p-0">
        <CollapsibleTrigger
          className="flex w-full items-center justify-center gap-2 rounded border bg-accent p-2"
          onClick={() => setPicksOpen(!picksOpen)}
        >
          <ChevronsUpDown className="h-4 w-4" />
          {picksOpen ? "Hide Picks" : "Show Picks"}
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto p-4">
            {data.games.map((game, index) => (
              <PicksLeagueGameBox
                key={game.id}
                game={game}
                pickType={pickType}
                oddEven={index % 2 === 0 ? "even" : "odd"}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

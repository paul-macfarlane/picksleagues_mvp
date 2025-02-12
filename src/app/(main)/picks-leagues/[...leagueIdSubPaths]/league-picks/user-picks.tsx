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
import { Separator } from "@/components/ui/separator";

export interface UserPicksProps {
  data: DBWeeklyPickDataByUser & {
    weekRank: number;
    seasonRank: number;
    seasonPoints: number;
  };
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
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={data.image ?? undefined} alt={data.username!} />
            <AvatarFallback>
              {data.username!.charAt(0).toLocaleUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="font-semibold">{data.username}</p>
            <span className="text-sm text-muted-foreground">{`${data.firstName} ${data.lastName}`}</span>
          </div>
        </div>

        <Separator />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <span className="text-sm font-semibold text-primary">
                  #{data.weekRank}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">Week</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/10">
                <span className="text-sm font-semibold text-success">
                  #{data.seasonRank}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">Season</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold text-primary`}>
                {pointsEarned} points this week
              </span>
              {pointsRemaining > 0 && (
                <span className="text-sm text-success">
                  ({pointsRemaining} remaining)
                </span>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              {data.seasonPoints} points this season
            </span>
          </div>
        </div>
      </div>

      <Collapsible open={picksOpen}>
        <CollapsibleTrigger
          className="flex w-full items-center justify-between bg-secondary p-4 text-secondary-foreground hover:bg-secondary/80"
          onClick={() => setPicksOpen(!picksOpen)}
        >
          <span className="text-sm font-medium">
            {picksOpen ? "Hide" : "Show"} Picks
          </span>
          <ChevronsUpDown className="h-4 w-4" />
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

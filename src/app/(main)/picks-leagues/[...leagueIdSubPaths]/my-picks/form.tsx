"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Trash2 } from "lucide-react";
import axios, { AxiosError } from "axios";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  GamePickStatuses,
  getGamePickSpreadDisplay,
  getGamePickStatus,
  getGamePickTimeDisplay,
} from "@/shared/picksLeaguePicks";
import { DbWeeklyPickGameData } from "@/db/sportLeagueWeeks";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface SelectedPickDetail {
  sportLeagueGameId: string;
  teamId: string;
}

interface MyPicksFormProps {
  picksLeagueId: string;
  requiredAmountOfPicks: number;
  picksMade: boolean;
  games: DbWeeklyPickGameData[];
  correctPickCount: number;
  correctPickPercentage: number;
  gamesRemaining: number;
}

export function PicksLeagueMyPicksForm({
  picksLeagueId,
  requiredAmountOfPicks,
  picksMade,
  games,
  correctPickCount,
  correctPickPercentage,
  gamesRemaining,
}: MyPicksFormProps) {
  const [selectedPickDetails, setSelectedPickDetails] = useState<
    SelectedPickDetail[]
  >(
    games
      .filter((data) => !!data.userPick)
      .map((data) => ({
        sportLeagueGameId: data.userPick!.sportLeagueGameId,
        teamId: data.userPick!.teamId,
      })),
  );
  const router = useRouter();
  const { toast } = useToast();

  const handlePickClicked = (clickedPick: SelectedPickDetail) => {
    let picksCopy = [...selectedPickDetails];
    // remove opposite pick on the same game if there was one
    picksCopy = picksCopy.filter(
      (pick) =>
        !(
          clickedPick.sportLeagueGameId === pick.sportLeagueGameId &&
          clickedPick.teamId !== pick.teamId
        ),
    );

    const indexOfPick = picksCopy.findIndex(
      (pick) => clickedPick.teamId === pick.teamId,
    );
    if (indexOfPick === -1 && picksCopy.length >= requiredAmountOfPicks) {
      // max picks made, don't add
      return;
    } else if (indexOfPick === -1) {
      picksCopy.push(clickedPick);
    } else {
      // remove pick if it was double-clicked
      picksCopy = picksCopy.filter(
        (pick) => clickedPick.teamId !== pick.teamId,
      );
    }

    setSelectedPickDetails(picksCopy);
  };

  const clearAllPicks = () => {
    setSelectedPickDetails([]);
  };

  const onSubmitPicks = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_HOST!}/api/picks-leagues/${picksLeagueId}/picks`,
        selectedPickDetails,
      );

      router.refresh();
    } catch (e) {
      let description = "An unexpected error occurred, please try again later.";
      if (e instanceof AxiosError && e.response?.data.error) {
        description = e.response.data.error;
      }

      toast({
        variant: "destructive",
        title: "Error",
        description,
      });
    }
  };

  const progress = picksMade
    ? correctPickPercentage
    : (selectedPickDetails.length / requiredAmountOfPicks) * 100;

  return (
    <>
      <CardContent>
        <div className="mb-4">
          <Progress value={progress} className="w-full" />
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {picksMade
                ? `${correctPickCount}/${requiredAmountOfPicks} Picks Correct - ${gamesRemaining} Remaining`
                : `${selectedPickDetails.length}/${requiredAmountOfPicks} picks made`}
            </p>

            {!picksMade && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllPicks}
                disabled={selectedPickDetails.length === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Picks
              </Button>
            )}
          </div>
        </div>

        <div className="h-full">
          {games.map((game) => {
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
                indicatorText = GamePickStatuses.PICKED;
                indicatorVariant = "blue";
                break;
              default:
                break;
            }

            // todo need a unified component/appearance for displaying user game picks between here and the league picks tab

            return (
              <div
                key={game.id}
                className={`mb-6 rounded border p-4 last:mb-0 ${gameBorder} flex flex-col justify-center gap-2`}
              >
                {indicatorText && (
                  <div>
                    <Badge variant={indicatorVariant}>{indicatorText}</Badge>
                  </div>
                )}
                <div className="flex items-center justify-between gap-1">
                  <span className="font-semibold">
                    {game.awayTeam.abbreviation} @ {game.homeTeam.abbreviation}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {getGamePickTimeDisplay(game)}
                  </span>
                </div>

                <RadioGroup
                  disabled={picksMade}
                  value={(() => {
                    const pick = selectedPickDetails.find(
                      (pick) => pick.sportLeagueGameId === game.id,
                    );
                    if (pick) {
                      return `${pick.sportLeagueGameId}:${pick.teamId}`;
                    }
                    return undefined;
                  })()}
                  className="space-y-1"
                >
                  <GameTeamLabel
                    itemId={`${game.id}:${game.awayTeamId}`}
                    disabled={picksMade}
                    checked={
                      !!selectedPickDetails.find(
                        (pick) =>
                          pick.sportLeagueGameId === game.id &&
                          pick.teamId === game.awayTeamId,
                      )
                    }
                    onClick={() =>
                      handlePickClicked({
                        sportLeagueGameId: game.id,
                        teamId: game.awayTeamId,
                      })
                    }
                    logoUrl={game.awayTeam.logoUrl!}
                    logoAlt={`${game.awayTeam.name} logo`}
                    teamAbbreviation={game.awayTeam.abbreviation}
                    spreadDisplay={getGamePickSpreadDisplay(game, "AWAY")}
                    teamScore={game.period > 0 ? game.awayTeamScore : null}
                    gamePickStatus={gamePickStatus}
                  />

                  <GameTeamLabel
                    itemId={`${game.id}:${game.homeTeamId}`}
                    disabled={picksMade}
                    checked={
                      !!selectedPickDetails.find(
                        (pick) =>
                          pick.sportLeagueGameId === game.id &&
                          pick.teamId === game.homeTeamId,
                      )
                    }
                    onClick={() =>
                      handlePickClicked({
                        sportLeagueGameId: game.id,
                        teamId: game.homeTeamId,
                      })
                    }
                    logoUrl={game.homeTeam.logoUrl!}
                    logoAlt={`${game.homeTeam.name} logo`}
                    teamAbbreviation={game.homeTeam.abbreviation}
                    spreadDisplay={getGamePickSpreadDisplay(game, "HOME")}
                    teamScore={game.period > 0 ? game.homeTeamScore : null}
                    gamePickStatus={getGamePickStatus(game, game.userPick)}
                  />
                </RadioGroup>
              </div>
            );
          })}
        </div>
      </CardContent>

      {!picksMade && (
        <CardFooter>
          <Button
            onClick={onSubmitPicks}
            className="w-full"
            disabled={selectedPickDetails.length < requiredAmountOfPicks}
          >
            Submit Picks ({selectedPickDetails.length}/{requiredAmountOfPicks})
          </Button>
        </CardFooter>
      )}
    </>
  );
}

interface GameTeamLabelProps {
  itemId: string;
  disabled: boolean;
  checked: boolean;
  onClick: () => void;
  logoUrl: string;
  logoAlt: string;
  teamAbbreviation: string;
  spreadDisplay: string | null;
  teamScore: number | null;
  gamePickStatus: GamePickStatuses;
}

function GameTeamLabel({
  itemId,
  disabled,
  checked,
  onClick,
  logoUrl,
  logoAlt,
  teamAbbreviation,
  spreadDisplay,
  teamScore,
  gamePickStatus,
}: GameTeamLabelProps) {
  let border = "";
  if (checked) {
    switch (gamePickStatus) {
      case GamePickStatuses.WIN:
        border = "border-primary";
        break;
      case GamePickStatuses.LOSS:
        border = "border-destructive";
        break;
      case GamePickStatuses.PUSH:
        border = "border-yellow-400";
        break;
      default:
        border = "border-blue-400";
        break;
    }
  }

  return (
    <Label
      htmlFor={itemId}
      className={`flex items-center justify-between gap-2 rounded-md border px-4 py-2 ${!disabled ? `focus-within:bg-accent hover:bg-accent` : ""} ${border} ${
        checked ? `bg-accent` : ""
      } `}
    >
      <RadioGroupItem
        id={itemId}
        value={itemId}
        className="sr-only"
        checked={checked}
        onClick={onClick}
      />

      <div className="flex items-center gap-2">
        <Image
          src={logoUrl!}
          alt={logoAlt}
          width={32}
          height={32}
          className="g-8 mr-2 w-8"
        />
        <span>{teamAbbreviation}</span>
        {spreadDisplay && (
          <span className="text-sm font-medium">{spreadDisplay}</span>
        )}
      </div>

      {teamScore !== null && <div>{teamScore}</div>}
    </Label>
  );
}

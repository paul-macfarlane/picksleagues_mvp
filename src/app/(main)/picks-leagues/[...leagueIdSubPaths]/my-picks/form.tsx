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
import { getGamePickSpreadDisplay } from "@/shared/picksLeaguePicks";
import { DbWeeklyPickGameData } from "@/db/sportLeagueWeeks";
import Image from "next/image";
import { PicksLeaguePickTypes } from "@/models/picksLeagues";
import { getGamePickTimeDisplay } from "@/shared/picksLeaguePicks";

interface SelectedPickDetail {
  sportLeagueGameId: string;
  teamId: string;
}

interface MyPicksFormProps {
  picksLeagueId: string;
  requiredAmountOfPicks: number;
  games: DbWeeklyPickGameData[];
  pickType: PicksLeaguePickTypes;
  timezone: string;
}

export function PicksLeagueMyPicksForm({
  picksLeagueId,
  requiredAmountOfPicks,
  games,
  pickType,
  timezone,
}: MyPicksFormProps) {
  const [selectedPickDetails, setSelectedPickDetails] = useState<
    SelectedPickDetail[]
  >([]);
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

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
      setSubmitting(true);
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

      setSubmitting(false);

      toast({
        variant: "destructive",
        title: "Error",
        description,
      });
    }
  };

  return (
    <>
      <CardContent className="flex flex-col gap-4">
        <div className="space-y-4">
          <Progress
            value={(selectedPickDetails.length / requiredAmountOfPicks) * 100}
            className="w-full"
          />
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {`${selectedPickDetails.length}/${requiredAmountOfPicks} picks made`}
            </p>

            <Button
              variant="outline"
              size="sm"
              onClick={clearAllPicks}
              disabled={selectedPickDetails.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All Picks
            </Button>
          </div>
        </div>

        <Button
          onClick={onSubmitPicks}
          className="w-full"
          disabled={
            selectedPickDetails.length < requiredAmountOfPicks || submitting
          }
        >
          {submitting ? "Submitting..." : "Submit Picks"}
        </Button>

        <div className="max-h-[60vh] overflow-y-auto">
          {games.map((game, index) => (
            <div
              key={game.id}
              className={`mb-6 flex flex-col justify-center gap-2 rounded border p-4 shadow-md md:gap-4 ${
                index % 2 === 0 ? "bg-muted/30" : "bg-card"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">
                  {game.awayTeam.abbreviation} @ {game.homeTeam.abbreviation}
                </span>
                <span className="text-sm text-muted-foreground">
                  {getGamePickTimeDisplay(game, timezone)}
                </span>
              </div>

              <RadioGroup
                value={(() => {
                  const pick = selectedPickDetails.find(
                    (pick) => pick.sportLeagueGameId === game.id,
                  );
                  if (pick) {
                    return `${pick.sportLeagueGameId}:${pick.teamId}`;
                  }
                  return undefined;
                })()}
                className="flex flex-col justify-between gap-2 md:flex-row md:gap-4"
              >
                <GameTeamLabel
                  itemId={`${game.id}:${game.awayTeamId}`}
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
                  spreadDisplay={
                    pickType === PicksLeaguePickTypes.AGAINST_THE_SPREAD
                      ? getGamePickSpreadDisplay(game, "AWAY")
                      : null
                  }
                />

                <GameTeamLabel
                  itemId={`${game.id}:${game.homeTeamId}`}
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
                  spreadDisplay={
                    pickType === PicksLeaguePickTypes.AGAINST_THE_SPREAD
                      ? getGamePickSpreadDisplay(game, "HOME")
                      : null
                  }
                />
              </RadioGroup>

              {pickType === PicksLeaguePickTypes.AGAINST_THE_SPREAD && (
                <div className="pr-2 text-right">
                  <p className="text-sm text-muted-foreground">
                    Odds presented by{" "}
                    <span className="italic">{game.odds[0].provider.name}</span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter></CardFooter>
    </>
  );
}

interface GameTeamLabelProps {
  itemId: string;
  checked: boolean;
  onClick: () => void;
  logoUrl: string;
  logoAlt: string;
  teamAbbreviation: string;
  spreadDisplay: string | null;
}

function GameTeamLabel({
  itemId,
  checked,
  onClick,
  logoUrl,
  logoAlt,
  teamAbbreviation,
  spreadDisplay,
}: GameTeamLabelProps) {
  return (
    <Label
      htmlFor={itemId}
      className={`flex flex-1 items-center justify-between gap-2 rounded-md border px-2 py-2 focus-within:bg-accent hover:cursor-pointer hover:bg-accent md:px-4 ${
        checked ? `border-neutral-blue bg-accent` : ""
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
        <Image src={logoUrl!} alt={logoAlt} width={32} height={32} />
        <span>{teamAbbreviation}</span>
        {spreadDisplay && (
          <span className="text-sm font-medium">{spreadDisplay}</span>
        )}
      </div>
    </Label>
  );
}

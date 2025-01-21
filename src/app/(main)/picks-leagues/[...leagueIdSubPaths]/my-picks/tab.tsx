import { DBPicksLeague } from "@/db/picksLeagues";
import { PicksLeagueMyPicksForm } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/my-picks/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GamePickStatuses, getGamePickStatus } from "@/shared/picksLeaguePicks";
import { getUserDBWeeklyPickData } from "@/db/sportLeagueWeeks";
import { SportLeagueGameStatuses } from "@/models/sportLeagueGames";

export async function PicksLeagueMyPicksTab({
  dbPicksLeague,
  userId,
}: {
  dbPicksLeague: DBPicksLeague;
  userId: string;
}) {
  const picksData = await getUserDBWeeklyPickData(dbPicksLeague.id, userId);
  if (!picksData) {
    return (
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>No Week Data</CardTitle>
          <CardDescription>
            There are no games to pick this week.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const picksMade = picksData.games.findIndex((game) => !!game.userPick) !== -1;
  if (picksMade) {
    picksData.games = picksData.games.filter((game) => !!game.userPick);
  } else {
    const now = new Date();
    picksData.games = picksData.games.filter((game) => game.startTime > now);
  }

  const requiredAmountOfPicks = Math.min(
    dbPicksLeague.picksPerWeek,
    picksData.games.length,
  );

  const correctPickCount = picksData.games.filter(
    (game) => getGamePickStatus(game, game.userPick) === GamePickStatuses.WIN,
  ).length;
  const correctPickPercentage =
    (correctPickCount / requiredAmountOfPicks) * 100;
  const gamesRemaining = picksData.games.filter(
    (game) => game.status !== SportLeagueGameStatuses.FINAL,
  ).length;
  const cardDescription = picksMade
    ? "View your picks for this week."
    : `Make your picks for this week's games
          "${dbPicksLeague.pickType}". You can make picks for games that have
          not started yet. You must pick all games at once. You cannot change
          your picks once they are made. Good luck!`;

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle>{picksData.name} Picks</CardTitle>
        <CardDescription>{cardDescription}</CardDescription>
      </CardHeader>

      {picksData.games.length > 0 ? (
        <PicksLeagueMyPicksForm
          picksLeagueId={dbPicksLeague.id}
          requiredAmountOfPicks={requiredAmountOfPicks}
          picksMade={picksMade}
          games={picksData.games}
          correctPickCount={correctPickCount}
          correctPickPercentage={correctPickPercentage}
          gamesRemaining={gamesRemaining}
        />
      ) : (
        <CardContent>
          <span>There are no more picks that can be made this week.</span>
        </CardContent>
      )}
    </Card>
  );
}

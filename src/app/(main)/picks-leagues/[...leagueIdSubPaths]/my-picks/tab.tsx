import { PicksLeagueMyPicksForm } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/my-picks/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPointsEarnedAndRemainingFromUserPickData } from "@/shared/picksLeaguePicks";
import {
  DBSportLeagueWeek,
  DBWeeklyPickDataByUserGame,
  getCurrentDBSportLeagueWeek,
  getUserDBWeeklyPickData,
} from "@/db/sportLeagueWeeks";
import { PicksLeagueGameBox } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/GameBox";
import { PicksLeaguePickTypes, PicksLeagueTabIds } from "@/models/picksLeagues";
import { getDBSportLeagueWeekById } from "@/db/sportLeagues";
import { getPrevAndNextDBWeekForPicksLeagueSeason } from "@/services/sportLeagueWeeks";
import { WeekSwitcher } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/WeekSwitcher";
import { DBPicksLeagueSeason } from "@/db/picksLeagueSeasons";
import { DBPicksLeagueWithUserRole } from "@/db/picksLeagues";
import { getDBPicksLeagueStandingsForUserAndSeason } from "@/db/picksLeagueStandings";
import { DBUser } from "@/db/users";
import { formatDateTime } from "@/shared/utils";

export interface PicksLeagueMyPicksTabProps {
  dbPicksLeague: DBPicksLeagueWithUserRole;
  dbPicksLeagueSeason: DBPicksLeagueSeason;
  seasonType: "current" | "next" | "previous";
  selectedWeekId: string | null;
  dbUser: DBUser;
}

export async function PicksLeagueMyPicksTab({
  dbPicksLeague,
  dbPicksLeagueSeason,
  seasonType,
  selectedWeekId,
  dbUser,
}: PicksLeagueMyPicksTabProps) {
  if (seasonType === "next") {
    const dbSportLeagueStartWeek = await getDBSportLeagueWeekById(
      dbPicksLeagueSeason.startSportLeagueWeekId,
    );

    return (
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>My Picks</CardTitle>
        </CardHeader>
        <CardContent>
          There are no picks to view or make right now.{" "}
          {dbSportLeagueStartWeek && (
            <>
              Wait until the season starts at{" "}
              {formatDateTime(
                dbSportLeagueStartWeek.startTime,
                dbUser.timezone,
              )}{" "}
              to make picks.
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  let selectedDBWeek: DBSportLeagueWeek | null;
  if (selectedWeekId) {
    selectedDBWeek = await getDBSportLeagueWeekById(selectedWeekId);
    if (
      !selectedDBWeek ||
      selectedDBWeek.seasonId !== dbPicksLeagueSeason?.sportLeagueSeasonId
    ) {
      return (
        <Card className="mx-auto w-full max-w-4xl">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Invalid week</CardDescription>
          </CardHeader>
          <CardContent>
            Invalid week. Please select a different week.
          </CardContent>
        </Card>
      );
    }
  } else if (seasonType === "current") {
    selectedDBWeek = await getCurrentDBSportLeagueWeek(
      dbPicksLeague.sportLeagueId,
    );
  } else {
    selectedDBWeek = await getDBSportLeagueWeekById(
      dbPicksLeagueSeason.endSportLeagueWeekId,
    );
  }

  if (!selectedDBWeek) {
    return (
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>
            An unexpected error occurred. Please come back later.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const standingsRecord = await getDBPicksLeagueStandingsForUserAndSeason(
    dbUser.id,
    dbPicksLeagueSeason.id,
  );

  const picksData = await getUserDBWeeklyPickData(
    dbPicksLeague.id,
    selectedDBWeek.id,
    dbUser.id,
  );
  const picksMade =
    picksData?.games.findIndex((game) => !!game.userPick) !== -1;
  if (picksMade && picksData) {
    picksData.games = picksData.games.filter((game) => !!game.userPick);
  } else if (picksData) {
    const now = new Date();
    picksData.games = picksData.games.filter((game) => game.startTime > now);
  }

  const requiredAmountOfPicks = Math.min(
    dbPicksLeague.picksPerWeek,
    picksData?.games.length ?? 0,
  );

  let pointsEarned = 0,
    pointsRemaining = 0;
  if (picksData) {
    ({ pointsEarned, pointsRemaining } =
      getPointsEarnedAndRemainingFromUserPickData(picksData));
  }

  let { previousWeek, nextWeek } =
    await getPrevAndNextDBWeekForPicksLeagueSeason(
      dbPicksLeagueSeason.id,
      selectedDBWeek.id,
    );
  const now = new Date();
  const activeWeekIsSelectedWeek =
    selectedDBWeek.startTime <= now && selectedDBWeek.endTime >= now;
  if (activeWeekIsSelectedWeek) {
    nextWeek = null;
  }

  const surpassedPickLockTime = now > selectedDBWeek.pickLockTime;

  return (
    <div className={"flex flex-col items-center gap-2"}>
      <WeekSwitcher
        previousWeek={previousWeek}
        picksLeagueId={dbPicksLeague.id}
        selectedDBWeek={selectedDBWeek}
        nextWeek={nextWeek}
        tab={PicksLeagueTabIds.MY_PICKS}
      />

      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader className="space-y-4">
          <CardTitle>My Picks</CardTitle>

          <div
            className={`mt-4 grid ${picksMade ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2"} gap-4`}
          >
            {picksMade && (
              <>
                <StatsBox label="Week Points" value={pointsEarned} />
                <StatsBox
                  label="Points Remaining"
                  value={pointsRemaining}
                  highlight={pointsRemaining > 0}
                />
              </>
            )}

            <StatsBox
              label="Season Rank"
              value={standingsRecord ? `#${standingsRecord.rank}` : "-"}
            />
            <StatsBox
              label="Season Points"
              value={standingsRecord ? standingsRecord.points : "-"}
            />
          </div>

          {!picksData && (
            <span>
              There are no games available to pick for {selectedDBWeek.name}.
            </span>
          )}

          {!picksMade &&
            picksData.games.length > 0 &&
            !surpassedPickLockTime && (
              <div className="flex flex-col gap-2">
                <span>Make your picks for this week&#39;s games.</span>

                <ul className={"list-inside list-disc space-y-1 text-sm"}>
                  <li>
                    You can make picks for games that have not started yet up
                    until the pick lock time of{" "}
                    {formatDateTime(
                      selectedDBWeek.pickLockTime,
                      dbUser.timezone,
                    )}
                    .
                  </li>
                  <li>
                    You can only make picks for games that have not started yet.
                  </li>
                  <li>You must pick all games at once.</li>
                  <li>You cannot change your picks once they are made.</li>
                  <li>Good luck!</li>
                </ul>
              </div>
            )}
        </CardHeader>

        {!picksMade && picksData.games.length === 0 && (
          <CardContent>
            <span>
              There are no more picks that can be made for {selectedDBWeek.name}
              .
            </span>
          </CardContent>
        )}

        {!picksMade && picksData.games.length > 0 && !surpassedPickLockTime && (
          <PicksLeagueMyPicksForm
            picksLeagueId={dbPicksLeague.id}
            requiredAmountOfPicks={requiredAmountOfPicks}
            games={picksData.games}
            pickType={dbPicksLeague.pickType}
            timezone={dbUser.timezone}
          />
        )}

        {!picksMade && surpassedPickLockTime && (
          <CardContent>
            <span>
              You can no longer make picks for {selectedDBWeek.name}. Pick lock
              time of{" "}
              {formatDateTime(selectedDBWeek.pickLockTime, dbUser.timezone)} has
              passed.
            </span>
          </CardContent>
        )}

        {picksMade && picksData && (
          <PicksList
            games={picksData.games.map((game) => ({
              ...game,
              userPick: game.userPick!,
              oddsProvider: game.odds[0].provider!,
            }))}
            pickType={dbPicksLeague.pickType}
            timezone={dbUser.timezone}
          />
        )}
      </Card>
    </div>
  );
}

interface PicksListProps {
  games: DBWeeklyPickDataByUserGame[];
  pickType: PicksLeaguePickTypes;
  timezone: string;
}

function PicksList({ games, pickType, timezone }: PicksListProps) {
  return (
    <CardContent className="space-y-6">
      <div className="space-y-4 sm:max-h-[60vh] sm:overflow-y-auto">
        {games.map((game, index) => (
          <PicksLeagueGameBox
            key={game.id}
            game={game}
            pickType={pickType}
            oddEven={index % 2 === 0 ? "even" : "odd"}
            timezone={timezone}
          />
        ))}
      </div>
    </CardContent>
  );
}

interface StatsBoxProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

function StatsBox({ label, value, highlight = false }: StatsBoxProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border bg-muted/30 p-2 text-center">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span
        className={`text-2xl font-bold ${
          highlight ? "text-success" : "text-primary"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

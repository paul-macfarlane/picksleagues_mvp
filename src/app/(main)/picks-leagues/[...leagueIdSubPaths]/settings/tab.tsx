import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PicksLeagueSettingsForm } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/settings/form";
import { PicksLeagueSettingsViewer } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/settings/viewer";
import { DBPicksLeague, getPickLeagueSettingsDetails } from "@/db/picksLeagues";
import { canEditPicksLeagueSeasonSettings } from "@/shared/picksLeagues";
import {
  getActiveDBPicksLeagueSeason,
  getNextDBPicksLeagueSeason,
} from "@/db/picksLeagueSeasons";
import { getDBSportLeagueWithSeasonDetails } from "@/db/sportLeagues";

export async function PicksLeagueSettingsTab({
  readonly,
  dbPicksLeague,
}: {
  readonly: boolean;
  dbPicksLeague: DBPicksLeague;
}) {
  let dbPicksLeagueSeason = await getActiveDBPicksLeagueSeason(
    dbPicksLeague.id,
  );
  if (!dbPicksLeagueSeason) {
    dbPicksLeagueSeason = await getNextDBPicksLeagueSeason(dbPicksLeague.id);
  }
  const dbSportLeagueDetails = dbPicksLeagueSeason
    ? await getDBSportLeagueWithSeasonDetails(
        dbPicksLeague.sportLeagueId,
        dbPicksLeagueSeason.sportLeagueSeasonId,
      )
    : null;
  if (!dbPicksLeagueSeason || !dbSportLeagueDetails) {
    return (
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>League season details not found.</CardContent>
      </Card>
    );
  }

  // only show weeks after current moment in time so league can not be set to date in past
  dbSportLeagueDetails.season.weeks = dbSportLeagueDetails.season.weeks.filter(
    (week) => week.startTime > new Date(),
  );

  const dbPicksLeagueDetails = await getPickLeagueSettingsDetails(
    dbPicksLeague.id,
    dbPicksLeagueSeason.id,
  );
  if (!dbPicksLeagueDetails) {
    return (
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>League details not found.</CardContent>
      </Card>
    );
  }

  const canEditSeasonSettings =
    !readonly && canEditPicksLeagueSeasonSettings(dbPicksLeagueDetails);

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle>
          {readonly ? "League Settings" : "Edit League Settings"}
        </CardTitle>
      </CardHeader>

      {readonly ? (
        <PicksLeagueSettingsViewer
          sportLeague={dbSportLeagueDetails}
          picksLeague={dbPicksLeagueDetails}
        />
      ) : (
        <PicksLeagueSettingsForm
          sportLeague={dbSportLeagueDetails}
          picksLeague={dbPicksLeagueDetails}
          canEditSeasonSettings={canEditSeasonSettings}
        />
      )}
    </Card>
  );
}

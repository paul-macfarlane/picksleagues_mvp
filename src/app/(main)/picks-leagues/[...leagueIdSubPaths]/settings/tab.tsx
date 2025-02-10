import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PicksLeagueSettingsForm } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/settings/form";
import { PicksLeagueSettingsViewer } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/settings/viewer";
import { DBPicksLeague, getPickLeagueSettingsDetails } from "@/db/picksLeagues";
import { canEditPicksLeagueSeasonSettings } from "@/shared/picksLeagues";
import { DBPicksLeagueSeason } from "@/db/picksLeagueSeasons";
import { getDBSportLeagueWithSeasonDetails } from "@/db/sportLeagues";

export async function PicksLeagueSettingsTab({
  readonly,
  dbPicksLeague,
  dbPicksLeagueSeason,
}: {
  readonly: boolean;
  dbPicksLeague: DBPicksLeague;
  dbPicksLeagueSeason: DBPicksLeagueSeason;
}) {
  const dbSportLeagueDetails = dbPicksLeagueSeason
    ? await getDBSportLeagueWithSeasonDetails(
        dbPicksLeague.sportLeagueId,
        dbPicksLeagueSeason.sportLeagueSeasonId,
      )
    : null;
  if (!dbSportLeagueDetails) {
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
          canEditSeasonSettings={canEditPicksLeagueSeasonSettings(
            dbPicksLeagueDetails,
          )}
        />
      )}
    </Card>
  );
}

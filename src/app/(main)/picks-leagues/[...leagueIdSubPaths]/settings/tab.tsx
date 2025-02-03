import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PicksLeagueSettingsForm } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/settings/form";
import { DBPicksLeague, getPickLeagueSettingsDetails } from "@/db/picksLeagues";
import { canEditPicksLeagueSeasonSettings } from "@/shared/picksLeagues";
import {
  getActiveDBPicksLeagueSeason,
  getNextDBPicksLeagueSeason,
} from "@/db/picksLeagueSeasons";
import { getActiveOrNextSportLeagueSeasonsDetails } from "@/services/sportLeagues";
import { getDBSportLeagueSeasonById } from "@/db/sportLeagueSeason";

export async function PicksLeagueSettingsTab({
  dbPicksLeague,
}: {
  dbPicksLeague: DBPicksLeague;
}) {
  let dbPicksLeagueSeason = await getActiveDBPicksLeagueSeason(
    dbPicksLeague.id,
  );
  if (!dbPicksLeagueSeason) {
    dbPicksLeagueSeason = await getNextDBPicksLeagueSeason(dbPicksLeague.id);
  }
  const dbSportsLeagueSeason = dbPicksLeagueSeason
    ? await getDBSportLeagueSeasonById(dbPicksLeagueSeason.sportLeagueSeasonId)
    : null;
  if (!dbPicksLeagueSeason || !dbSportsLeagueSeason) {
    return (
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>League season details not found.</CardContent>
      </Card>
    );
  }

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
    canEditPicksLeagueSeasonSettings(dbPicksLeagueDetails);
  const dbSportLeagueDetails = await getActiveOrNextSportLeagueSeasonsDetails();

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle>
          Edit League Settings ({dbSportsLeagueSeason.name} season)
        </CardTitle>
      </CardHeader>

      <PicksLeagueSettingsForm
        sportLeagues={dbSportLeagueDetails}
        picksLeague={dbPicksLeagueDetails}
        canEditSeasonSettings={canEditSeasonSettings}
      />
    </Card>
  );
}

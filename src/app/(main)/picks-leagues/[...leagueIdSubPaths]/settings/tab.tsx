import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PicksLeagueSettingsForm } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/settings/form";
import { DBPicksLeague, getPickLeagueSettingsDetails } from "@/db/picksLeagues";
import { getAllDBSportLeaguesWithActiveSeason } from "@/db/sportLeagues";
import { canEditPicksLeagueSeasonSettings } from "@/shared/picksLeagues";

export async function PicksLeagueSettingsTab({
  dbPicksLeague,
}: {
  dbPicksLeague: DBPicksLeague;
}) {
  const dbPicksLeagueDetails = await getPickLeagueSettingsDetails(
    dbPicksLeague.id,
  );
  if (!dbPicksLeagueDetails) {
    return (
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>League not found</CardTitle>
          <CardDescription>
            Modify your league&#39;s settings and configuration. Some settings
            cannot be changed while the season is in progress.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const canEditSeasonSettings =
    canEditPicksLeagueSeasonSettings(dbPicksLeagueDetails);
  const dbSportLeagueDetails = await getAllDBSportLeaguesWithActiveSeason();

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Edit League Settings</CardTitle>
        <CardDescription>
          Modify your league&#39;s settings and configuration. Some settings
          cannot be changed while the season is in progress.
        </CardDescription>
      </CardHeader>

      <PicksLeagueSettingsForm
        sportLeagues={dbSportLeagueDetails}
        picksLeague={dbPicksLeagueDetails}
        canEditSeasonSettings={canEditSeasonSettings}
      />
    </Card>
  );
}

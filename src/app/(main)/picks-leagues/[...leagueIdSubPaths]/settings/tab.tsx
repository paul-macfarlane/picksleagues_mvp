import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EditPicksLeagueForm } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/settings/form";
import { DBPicksLeague, getPickLeagueSettingsDetails } from "@/db/picksLeagues";
import { getAllDBSportLeaguesWithActiveSeason } from "@/db/sportLeagues";
import { canEditPicksLeagueSeasonSettings } from "@/services/picksLeagues";

export async function Tab({ dbPicksLeague }: { dbPicksLeague: DBPicksLeague }) {
  const dbPicksLeagueDetails = await getPickLeagueSettingsDetails(
    dbPicksLeague.id,
  );
  if (!dbPicksLeagueDetails) {
    return (
      <div>
        <span>League not found. Please return to your dashboard.</span>
      </div>
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

      <EditPicksLeagueForm
        sportLeagues={dbSportLeagueDetails}
        picksLeague={dbPicksLeagueDetails}
        canEditSeasonSettings={canEditSeasonSettings}
      />
    </Card>
  );
}

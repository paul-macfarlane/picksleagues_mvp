import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDBPicksLeagueSeasonStandingsWithMembers } from "@/db/picksLeagueStandings";
import {
  getActiveDBPicksLeagueSeason,
  getNextDBPicksLeagueSeason,
  getPreviousDBPicksLeagueSeason,
} from "@/db/picksLeagueSeasons";
import { getDBSportLeagueSeasonById } from "@/db/sportLeagueSeason";
import { DateDisplay } from "@/components/date-display";
import { DBSportLeagueWeek } from "@/db/sportLeagueWeeks";
import { getDBSportLeagueWeekById } from "@/db/sportLeagues";
import { StandingsTable } from "./table";

export interface PicksLeagueStandingsTabProps {
  picksLeagueId: string;
}

export async function PicksLeagueStandingsTab({
  picksLeagueId,
}: PicksLeagueStandingsTabProps) {
  let dbPicksLeagueSeason = await getActiveDBPicksLeagueSeason(picksLeagueId);
  if (!dbPicksLeagueSeason) {
    dbPicksLeagueSeason = await getPreviousDBPicksLeagueSeason(picksLeagueId);
  }
  if (!dbPicksLeagueSeason) {
    dbPicksLeagueSeason = await getNextDBPicksLeagueSeason(picksLeagueId);
    if (!dbPicksLeagueSeason) {
      return (
        <Card className="mx-auto w-full max-w-4xl">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>Unable to retrieve season standings</CardContent>
        </Card>
      );
    }

    let dbSportLeagueStartWeek: DBSportLeagueWeek | null = null;
    if (dbPicksLeagueSeason) {
      dbSportLeagueStartWeek = await getDBSportLeagueWeekById(
        dbPicksLeagueSeason.startSportLeagueWeekId,
      );
    }

    return (
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>League Standings</CardTitle>
        </CardHeader>
        <CardContent>
          There are no standings to view right now.{" "}
          {dbSportLeagueStartWeek && (
            <>
              Wait until the season starts at{" "}
              <DateDisplay
                timestampMS={dbSportLeagueStartWeek.startTime.getTime()}
              />
            </>
          )}{" "}
          to view standings.
        </CardContent>
      </Card>
    );
  }

  const dbSportLeagueSeason = await getDBSportLeagueSeasonById(
    dbPicksLeagueSeason.sportLeagueSeasonId,
  );
  if (!dbPicksLeagueSeason) {
    return (
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>Unable to find sport season for standings</CardContent>
      </Card>
    );
  }

  const dbLeagueStandingsWithMembers =
    await getDBPicksLeagueSeasonStandingsWithMembers(dbPicksLeagueSeason.id);

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle>League Standings</CardTitle>
      </CardHeader>

      <CardContent>
        <StandingsTable
          dbLeagueStandingsWithMembers={dbLeagueStandingsWithMembers}
        />
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDBPicksLeagueSeasonStandingsWithMembers } from "@/db/picksLeagueStandings";
import { DBPicksLeagueSeason } from "@/db/picksLeagueSeasons";
import { getDBSportLeagueSeasonById } from "@/db/sportLeagueSeason";
import { DateDisplay } from "@/components/date-display";
import { getDBSportLeagueWeekById } from "@/db/sportLeagues";
import { StandingsTable } from "./table";

export interface PicksLeagueStandingsTabProps {
  dbPicksLeagueSeason: DBPicksLeagueSeason;
  seasonType: "current" | "next" | "previous";
}

export async function PicksLeagueStandingsTab({
  dbPicksLeagueSeason,
  seasonType,
}: PicksLeagueStandingsTabProps) {
  if (seasonType === "next") {
    const dbSportLeagueStartWeek = await getDBSportLeagueWeekById(
      dbPicksLeagueSeason.startSportLeagueWeekId,
    );

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
              />{" "}
              to view standings.
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  const dbSportLeagueSeason = await getDBSportLeagueSeasonById(
    dbPicksLeagueSeason.sportLeagueSeasonId,
  );
  if (!dbSportLeagueSeason) {
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

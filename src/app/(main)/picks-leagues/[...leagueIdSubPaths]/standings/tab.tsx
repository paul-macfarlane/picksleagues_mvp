import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDBPicksLeagueSeasonStandingsWithMembers } from "@/db/picksLeagueStandings";
import { DBPicksLeagueSeason } from "@/db/picksLeagueSeasons";
import { getDBSportLeagueSeasonById } from "@/db/sportLeagueSeason";
import { getDBSportLeagueWeekById } from "@/db/sportLeagues";
import { StandingsTable } from "./table";
import { DBUser } from "@/db/users";
import { formatDateTime } from "@/shared/utils";

export interface PicksLeagueStandingsTabProps {
  dbUser: DBUser;
  dbPicksLeagueSeason: DBPicksLeagueSeason;
  seasonType: "current" | "next" | "previous";
}

export async function PicksLeagueStandingsTab({
  dbUser,
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
              {formatDateTime(
                dbSportLeagueStartWeek.startTime,
                dbUser.timezone,
              )}
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

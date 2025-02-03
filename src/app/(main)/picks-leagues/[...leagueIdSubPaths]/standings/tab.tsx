import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getDBPicksLeagueSeasonStandingsWithMembers } from "@/db/picksLeagueStandings";
import {
  getActiveDBPicksLeagueSeason,
  getNextDBPicksLeagueSeason,
  getPreviousDBPicksLeagueSeason,
} from "@/db/picksLeagueSeasons";
import {
  DBSportLeagueSeason,
  getDBSportLeagueSeasonById,
} from "@/db/sportLeagueSeason";
import { DateDisplay } from "@/components/date-display";
import { DBSportLeagueWeek } from "@/db/sportLeagueWeeks";
import { getDBSportLeagueWeekById } from "@/db/sportLeagues";

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

    let dbSportLeagueSeason: DBSportLeagueSeason | null = null;
    let dbSportLeagueStartWeek: DBSportLeagueWeek | null = null;
    if (dbPicksLeagueSeason) {
      dbSportLeagueSeason = await getDBSportLeagueSeasonById(
        dbPicksLeagueSeason.sportLeagueSeasonId,
      );
      dbSportLeagueStartWeek = await getDBSportLeagueWeekById(
        dbPicksLeagueSeason.startSportLeagueWeekId,
      );
    }

    return (
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>
            League Standings{" "}
            {dbSportLeagueSeason && <>({dbSportLeagueSeason.name} season)</>}
          </CardTitle>
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
        <CardTitle>
          League Standings ({dbSportLeagueSeason!.name} season)
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Member</TableHead>
              <TableHead className={"font-bold"}>Points</TableHead>
              <TableHead>Wins</TableHead>
              <TableHead>Losses</TableHead>
              <TableHead>Pushes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dbLeagueStandingsWithMembers.map((row) => (
              <TableRow key={row.user.id}>
                <TableCell>{row.standings.rank}</TableCell>
                <TableCell className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage
                      src={row.user.image ?? undefined}
                      alt={row.user.username!}
                    />
                    <AvatarFallback>
                      {row.user
                        .username!.split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <span>
                    {row.user.username} ({row.user.firstName}{" "}
                    {row.user.lastName})
                  </span>
                </TableCell>
                <TableCell className={"font-bold"}>
                  {row.standings.points}
                </TableCell>
                <TableCell>{row.standings.wins}</TableCell>
                <TableCell>{row.standings.losses}</TableCell>
                <TableCell>{row.standings.pushes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

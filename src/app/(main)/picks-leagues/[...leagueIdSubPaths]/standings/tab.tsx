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
import { getDBPicksLeagueStandingsWithMembers } from "@/db/picksLeagueStandings";

export interface PicksLeagueStandingsTabProps {
  picksLeagueId: string;
}

export async function PicksLeagueStandingsTab({
  picksLeagueId,
}: PicksLeagueStandingsTabProps) {
  const dbLeagueStandingsWithMembers =
    await getDBPicksLeagueStandingsWithMembers(picksLeagueId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>League Standings</CardTitle>
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
                      src={row.user.image ?? ""}
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

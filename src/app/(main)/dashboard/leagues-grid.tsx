import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UserDBPicksLeagueDetails } from "@/db/picksLeagues";
import { getPicksLeagueHomeUrl } from "@/models/picksLeagues";
import Link from "next/link";

export function LeaguesGrid({
  leagues,
}: {
  leagues: UserDBPicksLeagueDetails[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {leagues.map((league) => (
        <Link
          key={league.id}
          href={getPicksLeagueHomeUrl(league.id)}
          className="block transition-colors hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Card className="h-full transition-colors hover:border-primary hover:bg-muted/50">
            <CardHeader className="flex-row items-center gap-4 space-y-0">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={league.logoUrl ?? undefined}
                  alt={league.name}
                />
                <AvatarFallback className="text-lg">
                  {league.name[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <h3 className="font-semibold">{league.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {league.sportLeagueAbbreviation}
                </p>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Pick Type: {league.pickType}
                </p>
                <p className="text-sm text-muted-foreground">
                  Season: {league.sportLeagueSeasonName}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

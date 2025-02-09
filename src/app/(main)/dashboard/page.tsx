import { auth } from "@/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDBPicksLeagueDetailsForUser } from "@/db/picksLeagues";
import { CircleArrowRight, Plus, Trophy } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AUTH_URL } from "@/models/auth";
import { getDBPicksLeaguePendingInvitesForUser } from "@/db/picksLeagueInvite";
import { InviteActions } from "./invite-actions";
import { LeaguesTable } from "./leagues-table";

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user?.id) {
    return redirect(AUTH_URL);
  }

  const [dbPicksLeagueDetails, pendingInvites] = await Promise.all([
    getDBPicksLeagueDetailsForUser(session.user.id),
    getDBPicksLeaguePendingInvitesForUser(session.user.id),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex gap-4">
        <Button size="lg" className="flex-1" asChild>
          <Link href="/picks-leagues/create">
            <Plus className="mr-2 h-5 w-5" />
            Create League
          </Link>
        </Button>
        <Button size="lg" variant="secondary" className="flex-1" asChild>
          <Link href="/picks-leagues/join">
            <CircleArrowRight className="mr-2 h-5 w-5" />
            Join League
          </Link>
        </Button>
      </div>

      {pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CircleArrowRight className="h-5 w-5 text-primary" />
              Pending League Invites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {pendingInvites.map((invite) => (
                <li
                  key={invite.id}
                  className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={invite.logoUrl ?? undefined}
                        alt={invite.leagueName}
                      />
                      <AvatarFallback className="text-lg">
                        {invite.leagueName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="font-medium">{invite.leagueName}</p>
                      <p className="text-sm text-muted-foreground">
                        {invite.sportLeagueAbbreviation} • {invite.pickType}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Invited as {invite.role}
                      </p>
                    </div>
                  </div>
                  <InviteActions invite={invite} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Trophy className="h-5 w-5 text-primary" />
            Your Picks Leagues
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dbPicksLeagueDetails.length > 0 ? (
            <LeaguesTable leagues={dbPicksLeagueDetails} />
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Trophy className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-lg font-medium">No Active Leagues</p>
              <p className="text-sm text-muted-foreground">
                Create a new league or join an existing one to get started
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

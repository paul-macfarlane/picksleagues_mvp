import { auth } from "@/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDBPicksLeagueDetailsForUser } from "@/db/picksLeagues";
import { getPicksLeagueHomeUrl } from "@/models/picksLeagues";
import { ChevronRight, CircleArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AUTH_URL } from "@/models/auth";
import { getDBPicksLeaguePendingInvitesForUser } from "@/db/picksLeagueInvite";
import { InviteActions } from "./invite-actions";

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
    <div className="mx-auto w-full max-w-4xl space-y-4">
      {pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending League Invites</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {pendingInvites.map((invite) => (
                <li
                  key={invite.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="hidden md:block">
                      <AvatarImage
                        src={invite.logoUrl ?? undefined}
                        alt={invite.leagueName}
                      />
                      <AvatarFallback>{invite.leagueName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <p className="font-medium">{invite.leagueName}</p>
                      <p className="text-sm text-muted-foreground">
                        {invite.sportLeagueAbbreviation} • {invite.pickType}
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
          <CardTitle>Your Picks Leagues</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {dbPicksLeagueDetails.length > 0 ? (
              dbPicksLeagueDetails.map((picksLeagueDetail) => (
                <li key={picksLeagueDetail.id}>
                  <Button
                    asChild
                    variant="ghost"
                    className="flex w-full items-center justify-between px-0 py-2"
                  >
                    <Link href={getPicksLeagueHomeUrl(picksLeagueDetail.id)}>
                      <div className="flex items-center gap-2">
                        <Avatar className="hidden md:block">
                          <AvatarImage
                            src={picksLeagueDetail.logoUrl ?? undefined}
                            alt={picksLeagueDetail.name}
                          />
                          <AvatarFallback>
                            {picksLeagueDetail.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start">
                          <p className="font-medium">
                            {picksLeagueDetail.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {picksLeagueDetail.sportLeagueAbbreviation} •{" "}
                            {picksLeagueDetail.pickType}
                          </p>
                        </div>
                      </div>

                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </li>
              ))
            ) : (
              <p>
                You are not in any active Picks Leagues. Create or join one
                below!
              </p>
            )}
          </ul>
        </CardContent>

        <CardFooter className="flex w-full justify-between gap-2 md:gap-4">
          <Button className="flex w-full gap-1 md:gap-2" asChild>
            <Link href={"/picks-leagues/create"}>
              <Plus className="h-4 w-4" /> Create League
            </Link>
          </Button>

          <Button className="flex w-full gap-1 md:gap-2" asChild>
            <Link href={"/picks-leagues/join"}>
              <CircleArrowRight className="h-4 w-4" />
              Join League
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

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
import { getDBLeagueDetailsForUser } from "@/db/leagues";
import { getLeagueHomeUrl } from "@/models/leagues";
import { ChevronRight, CircleArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth");
  }

  const dbLeaguesForUser = await getDBLeagueDetailsForUser(session.user.id);

  return (
    <div className="container mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Leagues</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {dbLeaguesForUser.length > 0 ? (
              dbLeaguesForUser.map((leagueDetail) => (
                <li key={leagueDetail.id}>
                  <Button
                    asChild
                    variant="ghost"
                    className="flex w-full items-center justify-between px-0 py-2"
                  >
                    <Link href={getLeagueHomeUrl(leagueDetail.id)}>
                      <div className="flex items-center gap-2">
                        <Avatar className="hidden md:block">
                          <AvatarImage
                            src={leagueDetail.logoUrl ?? ""}
                            alt={leagueDetail.name}
                          />
                          <AvatarFallback>
                            {leagueDetail.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start">
                          <p className="font-medium">{leagueDetail.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {leagueDetail.sportName} • {leagueDetail.pickType}
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
                You are not in any active leagues. Create or join one below!
              </p>
            )}
          </ul>
        </CardContent>

        <CardFooter className="flex w-full gap-2 md:gap-4">
          <Button className="flex w-full gap-1 md:gap-2" asChild>
            <Link href={"/leagues/create"}>
              <Plus className="h-4 w-4" /> Create League
            </Link>
          </Button>

          <Button className="flex w-full gap-1 md:gap-2" asChild>
            <Link href={"/leagues/join"}>
              <CircleArrowRight className="h-4 w-4" />
              Join League
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

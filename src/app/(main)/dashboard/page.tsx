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
      <Card className="max-w-sm sm:max-w-2xl">
        <CardHeader>
          <CardTitle>Your Leagues</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {dbLeaguesForUser.length > 0 ? (
              dbLeaguesForUser.map((leagueDetail) => (
                <li key={leagueDetail.id}>
                  <Button
                    variant="ghost"
                    className="flex w-full items-center justify-between p-2 pl-0"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage
                          src={leagueDetail.logoUrl ?? ""}
                          alt={leagueDetail.name}
                        />
                        <AvatarFallback>{leagueDetail.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start">
                        <p className="font-medium">{leagueDetail.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {leagueDetail.sportName} • {leagueDetail.pickType}
                        </p>
                      </div>
                    </div>

                    <ChevronRight className="h-4 w-4" />
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

        <CardFooter className="flex gap-4">
          <Button asChild>
            <Link href={"/leagues/create"}>
              <Plus className="mr-2 h-4 w-4" /> Create League
            </Link>
          </Button>

          <Button asChild>
            <Link href={"/leagues/join"}>
              <CircleArrowRight className="mr-2 h-4 w-4" />
              Join League
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

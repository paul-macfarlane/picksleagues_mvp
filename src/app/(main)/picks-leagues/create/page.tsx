import { auth } from "@/auth";
import { CreatePicksLeagueForm } from "@/app/(main)/picks-leagues/create/form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAllDBSportLeaguesWithActiveSeason } from "@/db/sportLeagues";
import { redirect } from "next/navigation";

export default async function CreatePicksLeague() {
  const session = await auth();
  if (!session?.user) {
    return redirect("/auth");
  }

  const dbSportLeagueDetails = await getAllDBSportLeaguesWithActiveSeason();

  return (
    <div className="container mx-auto flex flex-col items-center justify-center gap-4">
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Create a new Picks League
          </CardTitle>
          <CardDescription>
            Set up your Pick League&apos;s details and rules
          </CardDescription>
        </CardHeader>

        <CreatePicksLeagueForm sportLeagues={dbSportLeagueDetails} />
      </Card>
    </div>
  );
}

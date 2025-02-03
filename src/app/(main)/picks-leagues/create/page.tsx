import { auth } from "@/auth";
import { CreatePicksLeagueForm } from "@/app/(main)/picks-leagues/create/form";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { AUTH_URL } from "@/models/auth";
import { getActiveOrNextSportLeagueSeasonsDetails } from "@/services/sportLeagues";

export default async function CreatePicksLeague() {
  const session = await auth();
  if (!session?.user) {
    return redirect(AUTH_URL);
  }

  const dbSportLeagueDetails = await getActiveOrNextSportLeagueSeasonsDetails();

  return (
    <div className="container mx-auto flex flex-col items-center justify-center gap-4">
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Create Picks League</CardTitle>
        </CardHeader>

        <CreatePicksLeagueForm sportLeagues={dbSportLeagueDetails} />
      </Card>
    </div>
  );
}

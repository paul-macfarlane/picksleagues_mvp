import { auth } from "@/auth";
import { CreateLeagueForm } from "@/app/(main)/leagues/create/form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAllDBSportsWithActiveSeason } from "@/db/sports";
import { redirect } from "next/navigation";

export default async function CreateLeague() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth");
  }

  const dbSportDetails = await getAllDBSportsWithActiveSeason();

  return (
    <div className="container mx-auto flex flex-col items-center justify-center gap-4">
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Create a New League
          </CardTitle>
          <CardDescription>
            Set up your league&apos;s details and rules
          </CardDescription>
        </CardHeader>

        <CreateLeagueForm sports={dbSportDetails} />
      </Card>
    </div>
  );
}

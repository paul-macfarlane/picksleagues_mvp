import { auth } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trophy, Users, TrendingUp } from "lucide-react";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session?.user?.id) {
    return redirect("/dashboard");
  }

  return (
    <div>
      <main className="container mx-auto px-2 py-8 text-center sm:px-4 sm:py-16">
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Compete with Friends in Sports Predictions
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
          Join Picks Leagues to put your sports knowledge to the test. Create or
          join leagues, make your picks, and see who comes out on top!
        </p>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <Users className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Create or Join Leagues</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Start your own league with friends or join existing ones.
                Customize settings to fit your group&apos;s style.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <TrendingUp className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Make Your Picks</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Pick against the spread or straight up. Test your sports
                knowledge weekly.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Trophy className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Compete and Win</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Track your performance, climb the leaderboards, and claim
                bragging rights as the top prognosticator.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </main>

      <section className="bg-muted py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-8 text-3xl font-bold">How It Works</h2>
          <ol className="mx-auto grid max-w-3xl gap-8 md:grid-cols-3">
            <li className="flex flex-col items-center">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                1
              </div>
              <h3 className="mb-2 text-xl font-semibold">Sign In</h3>
              <p className="text-muted-foreground">
                Sign in using same sign on with Google or Discord.
              </p>
            </li>
            <li className="flex flex-col items-center">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                2
              </div>
              <h3 className="mb-2 text-xl font-semibold">Join a League</h3>
              <p className="text-muted-foreground">
                Create your own league or join one with friends.
              </p>
            </li>
            <li className="flex flex-col items-center">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                3
              </div>
              <h3 className="mb-2 text-xl font-semibold">Make Picks</h3>
              <p className="text-muted-foreground">
                Submit your predictions for upcoming games each week.
              </p>
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
}

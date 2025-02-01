import { auth, signIn } from "@/auth";
import { Discord } from "@/components/icons/discord";
import { Google } from "@/components/icons/google";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";

export default async function AuthPage(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const session = await auth();
  if (session?.user) {
    return redirect("/dashboard");
  }

  const searchParams = await props.searchParams;
  const parseInviteId = z.string().uuid().safeParse(searchParams["inviteId"]);
  let redirectAfterSignInUrl = "/api/post-auth";
  if (parseInviteId.success) {
    redirectAfterSignInUrl =
      redirectAfterSignInUrl += `?inviteId=${parseInviteId.data}`;
  }

  return (
    <div className="h-full bg-gradient-to-b from-primary/20 to-background">
      <div className="container mx-auto flex h-full flex-col items-center justify-center gap-4 p-4">
        <Card className="w-full max-w-4xl">
          <CardHeader className="flex flex-row items-center justify-center gap-2 self-start md:gap-4">
            <Trophy className="h-12 w-12 text-primary" />
            <CardTitle className="text-3xl font-bold">Picks Leagues</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <form
              action={async () => {
                "use server";
                await signIn("google", {
                  redirectTo: redirectAfterSignInUrl,
                });
              }}
            >
              <Button type="submit" className="w-full" variant="outline">
                <Google className="mr-2 h-4 w-4" />
                Sign in with Google
              </Button>
            </form>

            <form
              action={async () => {
                "use server";
                await signIn("discord", {
                  redirectTo: redirectAfterSignInUrl,
                });
              }}
            >
              <Button type="submit" className="w-full" variant="outline">
                <Discord className="mr-2 h-4 w-4" />
                Sign in with Discord
              </Button>
            </form>
          </CardContent>
        </Card>

        <Button variant={"secondary"} asChild>
          <div>
            <ArrowLeft className="h-4 w-4" />
            <Link href={"/"}>{"Back to Home"}</Link>
          </div>
        </Button>
      </div>
    </div>
  );
}

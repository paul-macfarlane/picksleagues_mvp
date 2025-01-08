import { auth, signIn } from "@/auth";
import { Discord } from "@/components/icons/discord";
import { Google } from "@/components/icons/google";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";

export default async function AuthPage(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const session = await auth();
  if (session?.user) {
    return redirect("/dashboard");
  }

  const defaultTab =
    searchParams["defaultTab"] === "signup" ? "signup" : "signin";
  const parseInviteId = z.string().uuid().safeParse(searchParams["inviteId"]);
  let redirectAfterSignInUrl = "/api/post-auth";
  if (parseInviteId.success) {
    redirectAfterSignInUrl =
      redirectAfterSignInUrl += `?inviteId=${parseInviteId.data}`;
  }

  return (
    <div className="h-full bg-gradient-to-b from-primary/20 to-background">
      <div className="container mx-auto flex h-full flex-col items-center justify-center gap-4 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <Trophy className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">Picks Leagues</CardTitle>
            <CardDescription>
              Sign in or create an account to get started
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <div className="mt-4 space-y-4">
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

                  <Button className="w-full" variant="outline" disabled>
                    <Mail className="mr-2 h-4 w-4" />
                    Sign in with Email
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="signup">
                <div className="mt-4 space-y-4">
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
                      Sign up with Google
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
                    <Button className="w-full" variant="outline">
                      <Discord className="mr-2 h-4 w-4" />
                      Sign up with Discord
                    </Button>
                  </form>

                  <Button className="w-full" variant="outline" disabled>
                    <Mail className="mr-2 h-4 w-4" />
                    Sign up with Email
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 text-center">
            <p className="text-sm text-muted-foreground">
              *Sign Up with Email is not currently supported, but may be
              available in the future.
            </p>
          </CardFooter>
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

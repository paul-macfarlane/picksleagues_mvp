import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trophy } from "lucide-react";
import ProfileSetupForm from "@/components/forms/profile-setup";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDBUserById } from "@/db/users";

export default async function ProfileSetup() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth?defaultTab=signup");
  }

  const dbUser = await getDBUserById(session.user.id);
  if (!dbUser) {
    console.error(
      `Unable to find user in db for session on profile setup with id ${session.user.id}`,
    );

    redirect("/auth?defaultTab=signup");
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Trophy className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">
            Welcome to Picks Leagues
          </CardTitle>
          <CardDescription>
            Let&apos;s set up your profile to get started
          </CardDescription>
        </CardHeader>

        <ProfileSetupForm
          defaultValues={{
            username: dbUser.username ?? "",
            firstName: dbUser.firstName ?? "",
            lastName: dbUser.lastName ?? "",
          }}
        />
      </Card>
    </div>
  );
}

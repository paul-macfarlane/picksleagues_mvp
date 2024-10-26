import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/auth";
import UpdateProfileForm from "@/components/forms/update-profile";
import { redirect } from "next/navigation";
import { getDBUserById } from "@/db/users";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default async function Profile({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth");
  }

  const updateMode = searchParams["mode"] === "signup" ? "signup" : "update";

  const dbUser = await getDBUserById(session.user.id);
  if (!dbUser) {
    console.error(
      `Unable to find user in db for session on edit profile with id ${session.user.id}`,
    );

    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto flex max-w-2xl flex-col items-center justify-center gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {updateMode === "signup" ? "Create" : "Update"} Profile
          </CardTitle>
          <CardDescription>
            {updateMode === "signup" ? "Set " : "Update "}
            your personal information and profile picture
          </CardDescription>
        </CardHeader>

        <UpdateProfileForm
          defaultValues={{
            username: dbUser.username!,
            firstName: dbUser.firstName!,
            lastName: dbUser.lastName!,
            imageUrl: dbUser.image ?? undefined,
          }}
          postSubmitUrl={updateMode === "signup" ? "/dashboard" : undefined}
        />
      </Card>

      {updateMode === "update" ? (
        <Button asChild variant={"secondary"}>
          <Link href={"/dashboard"}>
            <ChevronLeft />
            Back to Dashboard
          </Link>
        </Button>
      ) : (
        <></>
      )}
    </div>
  );
}

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

export default async function Profile() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth");
  }

  const dbUser = await getDBUserById(session.user.id);
  if (!dbUser) {
    console.error(
      `Unable to find user in db for session on edit profile with id ${session.user.id}`,
    );

    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto flex min-h-[90vh] max-w-2xl items-center justify-center p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Update Profile</CardTitle>
          <CardDescription>
            Update your personal information and profile picture
          </CardDescription>
        </CardHeader>

        <UpdateProfileForm
          defaultValues={{
            username: dbUser.username!,
            firstName: dbUser.firstName!,
            lastName: dbUser.lastName!,
            imageUrl: dbUser.image ?? undefined,
          }}
        />
      </Card>
    </div>
  );
}

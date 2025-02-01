import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/auth";
import UpdateProfileForm from "@/app/(main)/profile/form";
import { redirect } from "next/navigation";
import { getDBUserById } from "@/db/users";
import { z } from "zod";
import { AUTH_URL } from "@/models/auth";

export default async function Profile(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const session = await auth();
  if (!session?.user?.id) {
    return redirect(AUTH_URL);
  }

  const updateMode = searchParams["mode"] === "signup" ? "signup" : "update";
  const parseInviteId = z.string().uuid().safeParse(searchParams["inviteId"]);
  let postSubmitUrl = "/dashboard";
  if (parseInviteId.success) {
    postSubmitUrl = `/invites/${parseInviteId.data}`;
  }

  const dbUser = await getDBUserById(session.user.id);
  if (!dbUser) {
    console.error(
      `Unable to find user in db for session on edit profile with id ${session.user.id}`,
    );

    return redirect(postSubmitUrl);
  }

  return (
    <Card className="mx-auto w-full max-w-4xl">
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
        postSubmitUrl={updateMode === "signup" ? postSubmitUrl : undefined}
      />
    </Card>
  );
}

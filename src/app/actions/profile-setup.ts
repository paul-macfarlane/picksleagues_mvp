"use server";

import { auth } from "@/auth";
import { ProfileSetupFormSchema } from "@/constants/users";
import { dbUsernameAvailable, getDBUserById, updateDBUser } from "@/db/users";
import { redirect } from "next/navigation";

export interface ProfileSetupFormState {
  fields?: Record<string, string>;
  errors?: {
    submit?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  };
}

export async function profileSetupAction(
  _prevState: ProfileSetupFormState,
  formData: FormData,
): Promise<ProfileSetupFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    // unauthed users should be redirected to sign up
    redirect("/auth?defaultTab=signup");
  }

  const fields: Record<string, string> = {};
  for (const key of Object.keys(formData)) {
    fields[key] = formData.get(key)?.toString() ?? "";
  }

  const dbUser = await getDBUserById(session.user.id);
  if (!dbUser) {
    console.error(
      `User with id ${session.user.id} from session not found in db`,
    );

    return {
      fields,
      errors: {
        submit: "An unexpected error occurred. Please try again later.",
      },
    };
  }

  const parseRes = ProfileSetupFormSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parseRes.success) {
    return {
      fields,
      errors: {
        username: parseRes.error.issues
          .filter((error) => error.path.join(".") === "username")
          .map((error) => error.message)
          .join(", "),
        firstName: parseRes.error.issues
          .filter((error) => error.path.join(".") === "firstName")
          .map((error) => error.message)
          .join(", "),
        lastName: parseRes.error.issues
          .filter((error) => error.path.join(".") === "lastName")
          .map((error) => error.message)
          .join(", "),
      },
    };
  }

  if (
    dbUser.username !== parseRes.data.username &&
    !(await dbUsernameAvailable(parseRes.data.username))
  ) {
    return {
      fields,
      errors: {
        username: `Username "${parseRes.data.username}" already taken.`,
      },
    };
  }

  await updateDBUser(dbUser.id, {
    username: parseRes.data.username,
    firstName: parseRes.data.firstName,
    lastName: parseRes.data.lastName,
  });

  redirect("/");
}

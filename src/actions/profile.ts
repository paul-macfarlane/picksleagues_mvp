"use server";

import { auth } from "@/auth";
import { dbUsernameAvailable, getDBUserById, updateDBUser } from "@/db/users";
import { UpdateProfileFormSchema } from "@/models/profile";
import { redirect } from "next/navigation";

export interface UpdateProfileFormState {
  fields?: Record<string, string>;
  errors?: {
    form?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
  };
}

export async function updateProfileAction(
  _prevState: UpdateProfileFormState,
  formData: FormData,
): Promise<UpdateProfileFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth");
  }

  const fields: Record<string, string> = {};
  for (const key of Object.keys(formData)) {
    fields[key] = formData.get(key)?.toString() ?? "";
  }

  const dbUser = await getDBUserById(session.user.id);
  if (!dbUser) {
    console.error(
      `User with id ${session.user.id} from session not found in db while updating profile`,
    );

    return {
      fields,
      errors: {
        form: "An unexpected error occurred. Please try again later.",
      },
    };
  }

  const parsed = UpdateProfileFormSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) {
    return {
      fields,
      errors: {
        username: parsed.error.issues
          .filter((error) => error.path.join(".") === "username")
          .map((error) => error.message)
          .join(", "),
        firstName: parsed.error.issues
          .filter((error) => error.path.join(".") === "firstName")
          .map((error) => error.message)
          .join(", "),
        lastName: parsed.error.issues
          .filter((error) => error.path.join(".") === "lastName")
          .map((error) => error.message)
          .join(", "),
        imageUrl: parsed.error.issues
          .filter((error) => error.path.join(".") === "imageUrl")
          .map((error) => error.message)
          .join(", "),
      },
    };
  }

  if (
    dbUser.username !== parsed.data.username &&
    !(await dbUsernameAvailable(parsed.data.username))
  ) {
    return {
      fields,
      errors: {
        username: `Username "${parsed.data.username}" already taken.`,
      },
    };
  }

  await updateDBUser(dbUser.id, {
    username: parsed.data.username,
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    image: parsed.data.imageUrl,
  });

  return {
    fields,
  };
}

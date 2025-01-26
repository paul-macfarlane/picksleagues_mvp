"use server";

import { auth } from "@/auth";
import { getDBUserById, dbUsernameAvailable, updateDBUser } from "@/db/users";
import { UpdateProfileFormSchema } from "@/models/users";
import { redirect } from "next/navigation";
import { AUTH_URL } from "@/models/auth";

export interface UpdateProfileFormState {
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
    return redirect(AUTH_URL);
  }

  const formDataObject = Object.fromEntries(formData);

  const fields: Record<string, string> = {};
  for (const key of Object.keys(formDataObject)) {
    fields[key] = formData.get(key)?.toString() ?? "";
  }

  const dbUser = await getDBUserById(session.user.id);
  if (!dbUser) {
    console.error(
      `User with id ${session.user.id} from session not found in db while updating profile`,
    );

    return {
      errors: {
        form: "An unexpected error occurred. Please try again later.",
      },
    };
  }

  const parsed = UpdateProfileFormSchema.safeParse(formDataObject);
  if (!parsed.success) {
    return {
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
      errors: {
        username: `Username "${parsed.data.username}" already taken.`,
      },
    };
  }

  await updateDBUser(dbUser.id, {
    username: parsed.data.username,
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    image: parsed.data.imageUrl.length > 0 ? parsed.data.imageUrl : null,
  });

  return {};
}

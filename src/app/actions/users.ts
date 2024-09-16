"use server";

import { auth } from "@/auth";
import { MAX_USERNAME_LENGTH, MIN_USERNAME_LENGTH } from "@/constants/users";
import { dbUsernameAvailable, getDBUserById, updateDBUser } from "@/db/users";
import { redirect } from "next/navigation";
import { z } from "zod";

export interface NewUserFormState {
  errors?: {
    submit?: string;
    username?: string;
  };
}

export async function newUserAction(
  _prevState: unknown,
  formData: FormData
): Promise<NewUserFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      errors: {
        submit: "You must be signed in to set up your profile.",
      },
    };
  }

  const dbUser = await getDBUserById(session.user.id);
  if (!dbUser) {
    console.error(
      `user with id ${session.user.id} from session not found in db`
    );

    return {
      errors: {
        submit: "An unexpected error occurred. Please try again later.",
      },
    };
  }

  const NewUserFormSchema = z.object({
    username: z
      .string()
      .min(
        MIN_USERNAME_LENGTH,
        `Must be at least ${MIN_USERNAME_LENGTH} characters`
      )
      .max(
        MAX_USERNAME_LENGTH,
        `Cannot be more than ${MAX_USERNAME_LENGTH} characters`
      ),
  });

  const parseRes = NewUserFormSchema.safeParse({
    username: formData.get("username") ?? undefined,
  });
  if (parseRes.error) {
    const errors = parseRes.error.issues;

    return {
      errors: {
        username: errors
          .filter((error) => error.path.join(".") === "username")
          .map((error) => error.message)
          .join(", "),
      },
    };
  }

  if (!(await dbUsernameAvailable(parseRes.data.username))) {
    return {
      errors: {
        username: `username "${parseRes.data.username}" already taken`,
      },
    };
  }

  await updateDBUser(dbUser.id, {
    username: parseRes.data.username,
  });

  redirect("/");
}

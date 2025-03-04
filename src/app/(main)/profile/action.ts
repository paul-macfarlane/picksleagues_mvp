"use server";

import { auth } from "@/auth";
import { updateUserProfile } from "@/services/users";
import { BadInputError } from "@/models/errors";
import { redirect } from "next/navigation";
import { AUTH_URL } from "@/models/auth";

export interface UpdateProfileFormState {
  errors?: {
    form?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
    timezone?: string;
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

  try {
    await updateUserProfile(session.user.id, formDataObject);
    return {};
  } catch (error) {
    console.error("Error updating profile:", error);

    if (error instanceof BadInputError && error.errors) {
      return {
        errors: {
          form: error.message,
          username: error.errors["username"],
          firstName: error.errors["firstName"],
          lastName: error.errors["lastName"],
          imageUrl: error.errors["imageUrl"],
          timezone: error.errors["timezone"],
        },
      };
    }

    return {
      errors: {
        form: "An unexpected error occurred. Please try again later.",
      },
    };
  }
}

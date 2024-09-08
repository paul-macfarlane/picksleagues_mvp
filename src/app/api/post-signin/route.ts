import { auth } from "@/auth";
import {
  dbUserExistsByUsername,
  getDBUserById,
  MAX_USERNAME_LENGTH,
  updateDBUser,
} from "@/db/users";
import { redirect } from "next/navigation";
import { generateUsername } from "unique-username-generator";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return redirect("/");
  }

  const dbUser = await getDBUserById(session.user.id);
  if (!dbUser) {
    console.error(
      `user with id ${session.user.id} from session not found in db`
    );

    return redirect("/");
  }

  if (!dbUser.username) {
    let generatedUsername = "";
    let attempts = 0;
    while (!generatedUsername && attempts < 10) {
      attempts++;

      const usernameCandidate = generateUsername(
        undefined,
        5,
        MAX_USERNAME_LENGTH
      );
      if (!(await dbUserExistsByUsername(usernameCandidate))) {
        generatedUsername = usernameCandidate;
      }
    }

    if (!generatedUsername) {
      // this is extremely unlikely, but in the event it happens just lop the error and continue to redirect the user so that they can pick their username
      console.error(
        `reached max attempts at generating username for user with id ${dbUser.id}`
      );
    } else {
      await updateDBUser(dbUser.id, { username: generatedUsername });
    }

    return redirect("/new-user");
  }

  return redirect("/");
}

import { auth } from "@/auth";
import { dbUsernameAvailable, getDBUserById, updateDBUser } from "@/db/users";
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
    let attempts = 0;
    let username = "";
    while (!username && attempts < 5) {
      attempts++;
      const usernameCandidate = generateUsername("", 3, 20);
      if (await dbUsernameAvailable(usernameCandidate)) {
        username = usernameCandidate;
      }
    }

    if (username) {
      await updateDBUser(session.user.id, {
        username,
      });
    } else {
      //this is extremely unlikely to happen, but if it does its fine the user will still be able to set their own username anyways
      console.error(
        `unable to generate unique username for user with id ${dbUser.id}`
      );
    }

    return redirect("/new-user");
  }

  return redirect("/");
}

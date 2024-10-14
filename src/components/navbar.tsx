import { Button } from "./ui/button";
import { ModeToggle } from "./mode-toggle";
import { Trophy } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { DBUser, getDBUserById } from "@/db/users";
import ProfileMenu from "./profile-menu";

export default async function Navbar() {
  const session = await auth();

  let dbUser: DBUser | null = null;
  if (session?.user?.id) {
    dbUser = await getDBUserById(session.user.id);
    if (!dbUser) {
      console.error(
        `Unable to find user in DB in navbar with id ${session?.user?.id}`,
      );
    }
  }

  return (
    <header className="container mx-auto p-4">
      <nav className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link className="group" href={session?.user ? "/dashboard" : "/"}>
            <Trophy className="h-6 w-6 text-primary group-focus:border group-focus:border-primary" />
          </Link>
          <span className="text-2xl font-bold">Picks Leagues</span>
        </div>
        <div className="flex items-center gap-2">
          {session?.user ? (
            <ProfileMenu
              user={{
                username: dbUser?.username ?? "",
                image: dbUser?.image ?? undefined,
                firstName: dbUser?.firstName ?? undefined,
                lastName: dbUser?.lastName ?? undefined,
              }}
            />
          ) : (
            <>
              <Button asChild>
                <Link href={"/auth"}>Sign In</Link>
              </Button>
              <ModeToggle />
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

import Navbar from "@/components/navbar";
import React from "react";
import { auth } from "@/auth";
import { DBUser, getDBUserById } from "@/db/users";
import {
  getDBPicksLeagueDetailsForUser,
  UserDBPicksLeagueDetails,
} from "@/db/picksLeagues";
import { headers } from "next/headers";

// users are pretty unlikely to be in more than 10 picks sport-leagues, but if they are they can view those on the dashboard
const MAX_PICKS_LEAGUES_TO_DISPLAY = 10;

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  let dbUser: DBUser | null = null;
  let dbPicksLeagueDetails: UserDBPicksLeagueDetails[] = [];
  if (session?.user?.id) {
    dbUser = await getDBUserById(session.user.id);
    if (dbUser) {
      dbPicksLeagueDetails = await getDBPicksLeagueDetailsForUser(
        dbUser.id,
        MAX_PICKS_LEAGUES_TO_DISPLAY,
      );
    } else {
      console.error(
        `Unable to find user in DB in navbar with id ${session?.user?.id}`,
      );
    }
  }

  const headersRes = await headers();
  const pathname = headersRes.get("x-current-path") ?? "";

  return (
    <>
      <Navbar
        dbUser={dbUser}
        pathname={pathname}
        maxLeaguesToDisplay={MAX_PICKS_LEAGUES_TO_DISPLAY}
        dbPicksLeagueDetails={dbPicksLeagueDetails}
      />

      <div className="h-full bg-gradient-to-b from-primary/20 to-background p-4">
        {children}
      </div>
    </>
  );
}

/* eslint @next/next/no-html-link-for-pages: 0 */
// TODO: ignoring linting rule here because the way the sheet works is once you click it the user would expect it to close
//  but with Next Link that won't happen because its not a fully page refresh. At some point maybe I can refactor this
//  to use something other than a sheet but this is fine for now.

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Trophy } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { getPicksLeagueHomeUrl } from "@/models/picksLeagues";
import React from "react";
import { UserDBPicksLeagueDetails } from "@/db/picksLeagues";

interface MobileNavbarProps {
  pathname: string;
  dbPicksLeagueDetails: UserDBPicksLeagueDetails[];
  maxLeaguesToDisplay: number;
}

export function MobileNavbar({
  pathname,
  dbPicksLeagueDetails,
  maxLeaguesToDisplay,
}: MobileNavbarProps) {
  return (
    <div className="flex items-center md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>

        <SheetContent side={"left"}>
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Trophy className="ml-2 h-6 w-6 text-primary" />
              <span className="text-2xl font-bold">Picks Leagues</span>
            </SheetTitle>
          </SheetHeader>

          <div className="py-4">
            <ul className="space-y-1">
              <li>
                <a
                  href={"/dashboard"}
                  className={`block p-2 text-sm focus:rounded focus:bg-accent ${pathname === "/dashboard" ? "bg-accent" : ""}`}
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href={"/picks-leagues/create"}
                  className={`block p-2 text-sm focus:rounded focus:bg-accent ${pathname === "/picks-leagues/create" ? "bg-accent" : ""}`}
                >
                  Create a League
                </a>
              </li>
              <li>
                <a
                  href="/picks-leagues/join"
                  className={`block p-2 text-sm focus:rounded focus:bg-accent ${pathname === "/picks-leagues/join" ? "bg-accent" : ""}`}
                >
                  Join a League
                </a>
              </li>

              <Separator />

              {dbPicksLeagueDetails
                .slice(0, maxLeaguesToDisplay)
                .map((league) => (
                  <li key={league.id}>
                    <a
                      href={getPicksLeagueHomeUrl(league.id)}
                      className={`block p-2 text-sm focus:rounded focus:bg-accent ${pathname.startsWith(`/picks-leagues/${league.id}`) ? "bg-accent" : ""}`}
                    >
                      {league.name}
                    </a>
                  </li>
                ))}
            </ul>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

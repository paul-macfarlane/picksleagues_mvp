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

          <div className="flex flex-1 flex-col gap-4 py-4">
            <ul className="space-y-2">
              <li>
                <a
                  href="/dashboard"
                  className={`block rounded-md p-3 hover:bg-accent ${
                    pathname === "/dashboard"
                      ? "border border-primary bg-muted"
                      : ""
                  }`}
                >
                  <span className="font-medium">Dashboard</span>
                </a>
              </li>

              <li>
                <a
                  href="/picks-leagues/create"
                  className={`block rounded-md p-3 hover:bg-accent ${
                    pathname === "/picks-leagues/create"
                      ? "border border-primary bg-muted"
                      : ""
                  }`}
                >
                  <span className="font-medium">Create League</span>
                </a>
              </li>

              <li>
                <a
                  href="/picks-leagues/join"
                  className={`block rounded-md p-3 hover:bg-accent ${
                    pathname === "/picks-leagues/join"
                      ? "border border-primary bg-muted"
                      : ""
                  }`}
                >
                  <span className="font-medium">Join League</span>
                </a>
              </li>

              {dbPicksLeagueDetails.length > 0 && (
                <li className="pt-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Your Leagues
                  </div>
                </li>
              )}
            </ul>

            <div className="max-h-[60vh] flex-1 overflow-y-auto">
              <ul className="space-y-2 pr-2">
                {dbPicksLeagueDetails
                  .slice(0, maxLeaguesToDisplay)
                  .map((league, index) => (
                    <li key={league.id}>
                      <a
                        href={getPicksLeagueHomeUrl(league.id)}
                        className={`block rounded-md p-3 hover:bg-accent ${
                          pathname.includes(league.id)
                            ? "border border-primary bg-muted"
                            : index % 2 === 0
                              ? "bg-card"
                              : "bg-muted/30"
                        }`}
                      >
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{league.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {league.sportLeagueAbbreviation} • {league.pickType}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {league.sportLeagueSeasonName}
                          </span>
                        </div>
                      </a>
                    </li>
                  ))}

                {dbPicksLeagueDetails.length > maxLeaguesToDisplay && (
                  <li>
                    <a
                      href="/dashboard"
                      className="block rounded-md p-3 text-center text-sm text-muted-foreground hover:bg-accent"
                    >
                      View all leagues
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

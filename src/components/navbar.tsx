import { Button } from "./ui/button";
import { ModeToggle } from "./mode-toggle";
import { Trophy } from "lucide-react";
import ProfileMenu from "./profile-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";
import React from "react";
import { getPicksLeagueHomeUrl } from "@/models/picksLeagues";
import { DBUser } from "@/db/users";
import { UserDBPicksLeagueDetails } from "@/db/picksLeagues";
import { MobileNavbar } from "@/components/mobile-navbar";
import { AUTH_URL } from "@/models/auth";

export interface NavbarProps {
  dbUser: DBUser | null;
  pathname: string;
  maxLeaguesToDisplay: number;
  dbPicksLeagueDetails: UserDBPicksLeagueDetails[];
}

export default function Navbar({
  dbUser,
  pathname,
  maxLeaguesToDisplay,
  dbPicksLeagueDetails,
}: NavbarProps) {
  // lint rules ignored below because in order for the pathname to update a full refresh is needed
  return (
    <header className="sticky top-0 z-10 mx-auto w-full border-b border-primary bg-primary-foreground bg-gradient-to-b from-primary/20 to-background p-4">
      <nav className="flex items-center justify-between">
        {dbUser ? (
          <div className="hidden items-center gap-4 md:flex">
            <NavigationMenu className="h-full">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="flex items-center space-x-2 border border-transparent bg-transparent !p-0 hover:!bg-transparent focus:!bg-transparent focus-visible:border-primary data-[active]:!bg-transparent data-[state=open]:!bg-transparent">
                    <Trophy className="h-6 w-6 text-primary" />
                    <span className="text-2xl font-bold">Picks Leagues</span>
                  </NavigationMenuTrigger>

                  <NavigationMenuContent>
                    <ul className="flex flex-col gap-2 p-4 md:w-[400px] lg:w-[500px]">
                      <li>
                        <NavigationMenuLink
                          asChild
                          className={`block rounded-md p-3 hover:bg-accent ${
                            pathname === "/dashboard"
                              ? "border border-primary bg-muted"
                              : ""
                          }`}
                        >
                          <a href="/dashboard" className="font-medium">
                            Dashboard
                          </a>
                        </NavigationMenuLink>
                      </li>

                      <li>
                        <NavigationMenuLink
                          asChild
                          className={`block rounded-md p-3 hover:bg-accent ${
                            pathname === "/picks-leagues/create"
                              ? "border border-primary bg-muted"
                              : ""
                          }`}
                        >
                          <a
                            href="/picks-leagues/create"
                            className="font-medium"
                          >
                            Create League
                          </a>
                        </NavigationMenuLink>
                      </li>

                      <li>
                        <NavigationMenuLink
                          asChild
                          className={`block rounded-md p-3 hover:bg-accent ${
                            pathname === "/picks-leagues/join"
                              ? "border border-primary bg-muted"
                              : ""
                          }`}
                        >
                          <a href="/picks-leagues/join" className="font-medium">
                            Join League
                          </a>
                        </NavigationMenuLink>
                      </li>

                      {dbPicksLeagueDetails.length > 0 && (
                        <li className="pt-2">
                          <div className="text-sm font-medium text-muted-foreground">
                            Your Leagues
                          </div>
                        </li>
                      )}

                      <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-2">
                        {dbPicksLeagueDetails
                          .slice(0, maxLeaguesToDisplay)
                          .map((league, index) => (
                            <li key={league.id}>
                              <NavigationMenuLink
                                asChild
                                className={`block rounded-md p-3 hover:bg-accent ${
                                  pathname.includes(league.id)
                                    ? "border border-primary bg-muted"
                                    : index % 2 === 0
                                      ? "bg-card"
                                      : "bg-muted/30"
                                }`}
                              >
                                <a
                                  href={getPicksLeagueHomeUrl(league.id)}
                                  className="flex flex-col gap-1"
                                >
                                  <span className="font-medium">
                                    {league.name}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {league.sportLeagueAbbreviation} •{" "}
                                    {league.pickType}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {league.sportLeagueSeasonName}
                                  </span>
                                </a>
                              </NavigationMenuLink>
                            </li>
                          ))}

                        {dbPicksLeagueDetails.length > maxLeaguesToDisplay && (
                          <li>
                            <NavigationMenuLink
                              asChild
                              className="block rounded-md p-3 text-center hover:bg-accent"
                            >
                              <a
                                href="/dashboard"
                                className="text-sm text-muted-foreground"
                              >
                                View all leagues
                              </a>
                            </NavigationMenuLink>
                          </li>
                        )}
                      </div>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        ) : (
          // for un-authed users
          // eslint-disable-next-line @next/next/no-html-link-for-pages
          <a className="flex items-center space-x-2" href={"/"}>
            <Trophy className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold">Picks Leagues</span>
          </a>
        )}

        {dbUser ? (
          <MobileNavbar
            pathname={pathname}
            dbPicksLeagueDetails={dbPicksLeagueDetails}
            maxLeaguesToDisplay={maxLeaguesToDisplay}
          />
        ) : (
          <></>
        )}

        {dbUser ? (
          <div className="ml-[-1.5rem] flex items-center gap-2 md:hidden">
            <Trophy className="ml-2 h-6 w-6 text-primary" />
            <span className="text-2xl font-bold">Picks Leagues</span>
          </div>
        ) : (
          <></>
        )}

        <div className="flex items-center gap-2">
          {dbUser ? (
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
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a href={AUTH_URL}>Sign In</a>
              </Button>
              <ModeToggle />
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

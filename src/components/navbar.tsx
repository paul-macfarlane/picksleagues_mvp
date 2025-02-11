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
import { Separator } from "./ui/separator";
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
                    <ul className="flex flex-col gap-2 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <li>
                        <NavigationMenuLink asChild>
                          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                          <a
                            className={`block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${pathname === "/dashboard" ? "bg-accent text-accent-foreground" : ""}`}
                            href="/dashboard"
                          >
                            <div className="text-sm font-medium leading-none">
                              Dashboard
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Go to Dashboard
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>

                      <li>
                        <NavigationMenuLink asChild>
                          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                          <a
                            className={`block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${pathname === "/picks-leagues/create" ? "bg-accent text-accent-foreground" : ""}`}
                            href="/picks-leagues/create"
                          >
                            <div className="text-sm font-medium leading-none">
                              Create a Picks League
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Start a new league and invite friends
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>

                      <li>
                        <NavigationMenuLink asChild>
                          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                          <a
                            className={`block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${pathname === "/picks-leagues/join" ? "bg-accent text-accent-foreground" : ""}`}
                            href="/picks-leagues/join"
                          >
                            <div className="text-sm font-medium leading-none">
                              Join a Picks League
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Join an existing league
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>

                      {dbPicksLeagueDetails.length > 0 && <Separator />}

                      {dbPicksLeagueDetails
                        .slice(0, maxLeaguesToDisplay)
                        .map((league) => (
                          <li key={league.id}>
                            <NavigationMenuLink asChild>
                              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                              <a
                                className={`block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${pathname.startsWith(`/picks-leagues/${league.id}`) ? "bg-accent text-accent-foreground" : ""}`}
                                href={getPicksLeagueHomeUrl(league.id)}
                              >
                                <div className="text-sm font-medium leading-none">
                                  {league.name}
                                </div>
                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                  {league.sportLeagueAbbreviation} •{" "}
                                  {league.pickType} •{" "}
                                  {league.sportLeagueSeasonName}
                                </p>
                              </a>
                            </NavigationMenuLink>
                          </li>
                        ))}
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

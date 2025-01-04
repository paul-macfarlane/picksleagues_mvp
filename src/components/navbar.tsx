import { Button } from "./ui/button";
import { ModeToggle } from "./mode-toggle";
import { Menu, Trophy } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { DBUser, getDBUserById } from "@/db/users";
import ProfileMenu from "./profile-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";
import { cn } from "@/lib/utils";
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { DBLeagueDetails, getDBLeagueDetailsForUser } from "@/db/leagues";
import { getLeagueHomeUrl } from "@/models/leagues";
import { headers } from "next/headers";
import { Separator } from "./ui/separator";

// users are pretty unlikely to be in more than 10 leagues, but if they are they can view those on the dashboard
const MAX_LEAGUES_TO_DISPLAY = 10;

export default async function Navbar() {
  const session = await auth();

  let dbUser: DBUser | null = null;
  let dbLeaguesForUser: DBLeagueDetails[] = [];
  if (session?.user?.id) {
    dbUser = await getDBUserById(session.user.id);
    if (dbUser) {
      dbLeaguesForUser = await getDBLeagueDetailsForUser(
        dbUser.id,
        MAX_LEAGUES_TO_DISPLAY,
      );
    } else {
      console.error(
        `Unable to find user in DB in navbar with id ${session?.user?.id}`,
      );
    }
  }

  const pathname = headers().get("x-current-path");

  return (
    <header className="sticky top-0 z-10 mx-auto w-full border-b border-primary bg-primary-foreground p-4">
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
                      <CustomMenuItem
                        href="/dashboard"
                        active={pathname === "/dashboard"}
                        title="Dashboard"
                      >
                        Go to Dashboard
                      </CustomMenuItem>

                      <CustomMenuItem
                        href="/leagues/create"
                        active={pathname === "/leagues/create"}
                        title="Create a League"
                      >
                        Start a new league and invite friends
                      </CustomMenuItem>

                      <CustomMenuItem
                        href="/leagues/join"
                        active={pathname === "/leagues/join"}
                        title="Join a League"
                      >
                        Join an existing league
                      </CustomMenuItem>

                      <Separator />

                      {dbLeaguesForUser
                        .slice(0, MAX_LEAGUES_TO_DISPLAY)
                        .map((league) => (
                          <CustomMenuItem
                            key={league.id}
                            href={getLeagueHomeUrl(league.id)}
                            active={pathname === getLeagueHomeUrl(league.id)}
                            title={league.name}
                          >
                            {league.sportLeagueAbbreviation} • {league.pickType}
                          </CustomMenuItem>
                        ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        ) : (
          // for unauthed users
          <Link className="flex items-center space-x-2" href={"/"}>
            <Trophy className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold">Picks Leagues</span>
          </Link>
        )}

        {dbUser ? (
          <div className="flex items-center md:hidden">
            <div>
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
                          href="/dashboard"
                          className={`block p-2 text-sm focus:rounded focus:bg-accent ${pathname === "/dashboard" ? "bg-accent" : ""}`}
                        >
                          Dashboard
                        </a>
                      </li>
                      <li>
                        <a
                          href="/leagues/create"
                          className={`block p-2 text-sm focus:rounded focus:bg-accent ${pathname === "/leagues/create" ? "bg-accent" : ""}`}
                        >
                          Create a League
                        </a>
                      </li>
                      <li>
                        <a
                          href="/leagues/join"
                          className={`block p-2 text-sm focus:rounded focus:bg-accent ${pathname === "/leagues/join" ? "bg-accent" : ""}`}
                        >
                          Join a League
                        </a>
                      </li>

                      <Separator />

                      {dbLeaguesForUser
                        .slice(0, MAX_LEAGUES_TO_DISPLAY)
                        .map((league) => (
                          <li key={league.id}>
                            <a
                              href={getLeagueHomeUrl(league.id)}
                              className={`block p-2 text-sm focus:rounded focus:bg-accent ${pathname === getLeagueHomeUrl(league.id) ? "bg-accent" : ""}`}
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
          </div>
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

interface CustomMenuItemProps extends React.ComponentPropsWithoutRef<"a"> {
  active?: boolean;
}

const CustomMenuItem = React.forwardRef<
  React.ElementRef<"a">,
  CustomMenuItemProps
>(({ className, title, children, active, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            `block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${active ? "bg-accent text-accent-foreground" : ""}`,
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
CustomMenuItem.displayName = "CustomMenuItem";

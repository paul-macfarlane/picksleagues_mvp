import { auth } from "@/auth";
import { MembersTab } from "@/app/(main)/leagues/[...leagueIdSubPaths]/members-tab";
import LeagueTabs, {
  SelectedTabWithContent,
} from "@/app/(main)/leagues/[...leagueIdSubPaths]/tabs";
import { getDBLeagueByIdWithUserRole } from "@/db/leagues";
import {
  COMMISSIONER_LEAGUE_TABS,
  LeagueMemberRoles,
  LeagueTabIds,
  MEMBER_LEAGUE_TABS,
} from "@/models/leagues";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { z } from "zod";

export default async function League({
  params,
  children,
}: {
  params: { leagueIdSubPaths: string[] };
  children: ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return redirect("/auth");
  }

  const parseLeagueId = z.string().uuid().safeParse(params.leagueIdSubPaths[0]);
  if (!parseLeagueId.success) {
    return (
      <div className="container mx-auto">
        <p>Invalid League URL. Please return to your dashboard.</p>
      </div>
    );
  }

  const leagueId = parseLeagueId.data;

  const dbLeagueWithRole = await getDBLeagueByIdWithUserRole(
    leagueId,
    session.user.id,
  );
  if (!dbLeagueWithRole) {
    return (
      <div className="container mx-auto">
        <p>League not found. Please return to your dashboard.</p>
      </div>
    );
  }

  if (dbLeagueWithRole.role === LeagueMemberRoles.NONE) {
    return (
      <div className="container mx-auto">
        <p>
          You are not a part of this league. Please return to your dashboard.
        </p>
      </div>
    );
  }

  const headerList = headers();
  const pathname = headerList.get("x-current-path");

  let tabs = MEMBER_LEAGUE_TABS;
  if (dbLeagueWithRole.role === LeagueMemberRoles.COMMISSIONER) {
    tabs = COMMISSIONER_LEAGUE_TABS;
  }

  let selectedTabId = LeagueTabIds.MEMBERS;
  let selectedTabContent = <>Default (should not happen)</>;
  switch (pathname) {
    case `/leagues/${leagueId}/${LeagueTabIds.MEMBERS}`:
      selectedTabContent = <MembersTab dbLeague={dbLeagueWithRole} />;
      break;
    case `/leagues/${leagueId}/${LeagueTabIds.MY_PICKS}`:
      selectedTabId = LeagueTabIds.MY_PICKS;
      selectedTabContent = <>My Picks</>;
      break;
    case `/leagues/${leagueId}/${LeagueTabIds.LEAGUE_PICKS}`:
      selectedTabId = LeagueTabIds.LEAGUE_PICKS;
      selectedTabContent = <>League Picks</>;
      break;
    case `/leagues/${leagueId}/${LeagueTabIds.SETTINGS}`:
      if (dbLeagueWithRole.role !== LeagueMemberRoles.COMMISSIONER) {
        return (
          <div className="container mx-auto">
            <p>
              You don't have permissions to view this page. Please return to
              your dashboard.
            </p>
          </div>
        );
      }

      selectedTabId = LeagueTabIds.SETTINGS;
      selectedTabContent = <>Settings</>;
      break;
    default:
      return (
        <div className="container mx-auto">
          <p>Invalid League URL. Please return to your dashboard.</p>
        </div>
      );
  }

  const selectedTab: SelectedTabWithContent = {
    id: selectedTabId,
    content: selectedTabContent,
  };

  return (
    <div className="container mx-auto space-y-4">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{dbLeagueWithRole.name}</h1>
          <p className="text-muted-foreground">
            {dbLeagueWithRole.sportName} • {dbLeagueWithRole.pickType}
          </p>
        </div>
      </header>

      <LeagueTabs
        leagueId={dbLeagueWithRole.id}
        defaultValue={selectedTabId}
        tabs={tabs}
        selectedTab={selectedTab}
      />

      {children}
    </div>
  );
}

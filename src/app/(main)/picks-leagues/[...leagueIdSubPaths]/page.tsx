import { auth } from "@/auth";
import LeagueTabs, {
  SelectedTabWithContent,
} from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/tabs";
import { getDBPicksLeagueByIdWithUserRole } from "@/db/picksLeagues";
import {
  COMMISSIONER_PICKS_LEAGUE_TABS,
  PicksLeagueTabIds,
  MEMBER_PICKS_LEAGUE_TABS,
} from "@/models/picksLeagues";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { PicksLeagueMemberRoles } from "@/models/picksLeagueMembers";
import { PicksLeagueMembersTab } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/members/tab";
import { PicksLeagueSettingsTab } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/settings/tab";
import { PicksLeagueMyPicksTab } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/my-picks/tab";

function ErrorComponent({ message }: { message: string }) {
  return (
    <div className="container mx-auto">
      <p>{message}</p>
    </div>
  );
}

export default async function PicksLeaguePage(props: {
  params: Promise<{ leagueIdSubPaths: string[] | undefined }>;
}) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user?.id) {
    return redirect("/auth");
  }

  const parseLeagueId = z
    .string()
    .uuid()
    .safeParse(
      params.leagueIdSubPaths ? params.leagueIdSubPaths[0] : undefined,
    );
  if (!parseLeagueId.success) {
    return (
      <ErrorComponent message="Invalid League URL. Please return to your dashboard." />
    );
  }

  const leagueId = parseLeagueId.data;

  const dbLeagueWithRole = await getDBPicksLeagueByIdWithUserRole(
    leagueId,
    session.user.id,
  );
  if (!dbLeagueWithRole) {
    return (
      <ErrorComponent message="League not found. Please return to your dashboard." />
    );
  }

  if (dbLeagueWithRole.role === PicksLeagueMemberRoles.NONE) {
    return (
      <ErrorComponent message="You are not a part of this league. Please return to your dashboard." />
    );
  }

  const headerList = await headers();
  const pathname = headerList.get("x-current-path");

  let tabs = MEMBER_PICKS_LEAGUE_TABS;
  if (dbLeagueWithRole.role === PicksLeagueMemberRoles.COMMISSIONER) {
    tabs = COMMISSIONER_PICKS_LEAGUE_TABS;
  }

  let selectedTabId = PicksLeagueTabIds.MEMBERS;
  let selectedTabContent = <>Default (should not happen)</>;
  switch (pathname) {
    case `/picks-leagues/${leagueId}/${PicksLeagueTabIds.MEMBERS}`:
      selectedTabContent = (
        <PicksLeagueMembersTab dbLeague={dbLeagueWithRole} />
      );
      break;
    case `/picks-leagues/${leagueId}/${PicksLeagueTabIds.MY_PICKS}`:
      selectedTabId = PicksLeagueTabIds.MY_PICKS;
      selectedTabContent = (
        <PicksLeagueMyPicksTab
          dbPicksLeague={dbLeagueWithRole}
          userId={session.user.id}
        />
      );
      break;
    case `/picks-leagues/${leagueId}/${PicksLeagueTabIds.LEAGUE_PICKS}`:
      selectedTabId = PicksLeagueTabIds.LEAGUE_PICKS;
      selectedTabContent = <>League Picks</>;
      break;
    case `/picks-leagues/${leagueId}/${PicksLeagueTabIds.SETTINGS}`:
      if (dbLeagueWithRole.role !== PicksLeagueMemberRoles.COMMISSIONER) {
        return (
          <ErrorComponent
            message={`You don't have permissions to view this page. Please return to your dashboard.`}
          />
        );
      }

      selectedTabId = PicksLeagueTabIds.SETTINGS;
      selectedTabContent = (
        <PicksLeagueSettingsTab dbPicksLeague={dbLeagueWithRole} />
      );
      break;
    default:
      return (
        <ErrorComponent message="Invalid League URL. Please return to your dashboard." />
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
            {dbLeagueWithRole.sportLeagueAbbreviation} •{" "}
            {dbLeagueWithRole.pickType}
          </p>
        </div>
      </header>

      <LeagueTabs
        leagueId={dbLeagueWithRole.id}
        defaultValue={selectedTabId}
        tabs={tabs}
        selectedTab={selectedTab}
      />
    </div>
  );
}

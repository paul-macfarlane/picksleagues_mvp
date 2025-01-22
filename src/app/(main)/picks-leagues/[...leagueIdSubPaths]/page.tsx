import { auth } from "@/auth";
import LeagueTabs, {
  SelectedTabWithContent,
} from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/tabs";
import { getDBPicksLeagueByIdWithUserRole } from "@/db/picksLeagues";
import {
  COMMISSIONER_PICKS_LEAGUE_TABS,
  PicksLeagueTabIds,
  MEMBER_PICKS_LEAGUE_TABS,
  PicksLeaguePickTypes,
} from "@/models/picksLeagues";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { PicksLeagueMemberRoles } from "@/models/picksLeagueMembers";
import { PicksLeagueMembersTab } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/members/tab";
import { PicksLeagueSettingsTab } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/settings/tab";
import { PicksLeagueMyPicksTab } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/my-picks/tab";
import { LeaguePicksTab } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/league-picks/tab";
import { getDBUserById } from "@/db/users";

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

  const dbUser = await getDBUserById(session.user.id);
  if (!dbUser) {
    console.error(
      `Unable to find user in db for session on picks league page with user id ${session.user.id}`,
    );

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
  const picksLeagueId = parseLeagueId.data;

  const dbPicksLeagueWithUserRole = await getDBPicksLeagueByIdWithUserRole(
    picksLeagueId,
    session.user.id,
  );
  if (!dbPicksLeagueWithUserRole) {
    return (
      <ErrorComponent message="League not found. Please return to your dashboard." />
    );
  }

  if (dbPicksLeagueWithUserRole.role === PicksLeagueMemberRoles.NONE) {
    return (
      <ErrorComponent message="You are not a part of this league. Please return to your dashboard." />
    );
  }

  const headerList = await headers();
  const pathname = headerList.get("x-current-path");

  let tabs = MEMBER_PICKS_LEAGUE_TABS;
  if (dbPicksLeagueWithUserRole.role === PicksLeagueMemberRoles.COMMISSIONER) {
    tabs = COMMISSIONER_PICKS_LEAGUE_TABS;
  }

  let selectedTabId = PicksLeagueTabIds.MEMBERS;
  let selectedTabContent = <>Default (should not happen)</>;
  switch (pathname) {
    case `/picks-leagues/${picksLeagueId}/${PicksLeagueTabIds.MEMBERS}`:
      selectedTabContent = (
        <PicksLeagueMembersTab dbLeague={dbPicksLeagueWithUserRole} />
      );
      break;
    case `/picks-leagues/${picksLeagueId}/${PicksLeagueTabIds.MY_PICKS}`:
      selectedTabId = PicksLeagueTabIds.MY_PICKS;
      selectedTabContent = (
        <PicksLeagueMyPicksTab
          picksLeagueId={dbPicksLeagueWithUserRole.id}
          sportsLeagueId={dbPicksLeagueWithUserRole.sportLeagueId}
          picksPerWeek={dbPicksLeagueWithUserRole.picksPerWeek}
          userId={session.user.id}
          pickType={dbPicksLeagueWithUserRole.pickType as PicksLeaguePickTypes}
        />
      );
      break;
    case `/picks-leagues/${picksLeagueId}/${PicksLeagueTabIds.LEAGUE_PICKS}`:
      selectedTabId = PicksLeagueTabIds.LEAGUE_PICKS;
      selectedTabContent = (
        <LeaguePicksTab
          picksLeagueId={dbPicksLeagueWithUserRole.id}
          sportsLeagueId={dbPicksLeagueWithUserRole.sportLeagueId}
          userId={dbUser.id}
          pickType={dbPicksLeagueWithUserRole.pickType as PicksLeaguePickTypes}
        />
      );
      break;
    case `/picks-leagues/${picksLeagueId}/${PicksLeagueTabIds.SETTINGS}`:
      if (
        dbPicksLeagueWithUserRole.role !== PicksLeagueMemberRoles.COMMISSIONER
      ) {
        return (
          <ErrorComponent
            message={
              "You don't have permissions to view this page. Please return to your dashboard."
            }
          />
        );
      }

      selectedTabId = PicksLeagueTabIds.SETTINGS;
      selectedTabContent = (
        <PicksLeagueSettingsTab dbPicksLeague={dbPicksLeagueWithUserRole} />
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
          <h1 className="text-3xl font-bold">
            {dbPicksLeagueWithUserRole.name}
          </h1>
          <p className="text-muted-foreground">
            {dbPicksLeagueWithUserRole.sportLeagueAbbreviation} •{" "}
            {dbPicksLeagueWithUserRole.pickType}
          </p>
        </div>
      </header>

      <LeagueTabs
        leagueId={dbPicksLeagueWithUserRole.id}
        defaultValue={selectedTabId}
        tabs={tabs}
        selectedTab={selectedTab}
      />
    </div>
  );
}

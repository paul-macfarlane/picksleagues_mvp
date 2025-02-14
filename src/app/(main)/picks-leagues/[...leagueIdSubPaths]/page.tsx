import { auth } from "@/auth";
import LeagueTabs, {
  SelectedTabWithContent,
} from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/tabs";
import { getDBPicksLeagueByIdWithUserRole } from "@/db/picksLeagues";
import {
  MEMBER_PICKS_LEAGUE_TABS,
  PicksLeagueTabIds,
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
import { PicksLeagueStandingsTab } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/standings/tab";
import { AUTH_URL } from "@/models/auth";
import { getDBPicksLeagueMemberDetails } from "@/db/picksLeagueMembers";
import { getOutstandingDBPicksLeagueInvitesWithUser } from "@/db/picksLeagueInvite";
import {
  getActiveDBPicksLeagueSeason,
  getNextDBPicksLeagueSeason,
  getPreviousDBPicksLeagueSeason,
} from "@/db/picksLeagueSeasons";
import { getDBSportLeagueSeasonById } from "@/db/sportLeagueSeason";

function ErrorComponent({ message }: { message: string }) {
  return (
    <div className="container mx-auto">
      <p>{message}</p>
    </div>
  );
}

export default async function PicksLeaguePage(props: {
  params: Promise<{ leagueIdSubPaths: string[] | undefined }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const session = await auth();
  if (!session?.user?.id) {
    return redirect(AUTH_URL);
  }

  const dbUser = await getDBUserById(session.user.id);
  if (!dbUser) {
    console.error(
      `Unable to find user in db for session on picks league page with user id ${session.user.id}`,
    );

    return redirect(AUTH_URL);
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

  let seasonType: "current" | "next" | "previous" = "current";
  let dbPicksLeagueSeason = await getActiveDBPicksLeagueSeason(
    dbPicksLeagueWithUserRole.id,
  );
  if (!dbPicksLeagueSeason) {
    dbPicksLeagueSeason = await getNextDBPicksLeagueSeason(
      dbPicksLeagueWithUserRole.id,
    );
    seasonType = "next";
  }
  if (!dbPicksLeagueSeason) {
    dbPicksLeagueSeason = await getPreviousDBPicksLeagueSeason(
      dbPicksLeagueWithUserRole.id,
    );
    seasonType = "previous";
  }
  if (!dbPicksLeagueSeason) {
    return (
      <ErrorComponent message="League season not found. Please return to your dashboard." />
    );
  }
  const dbSportLeagueSeason = await getDBSportLeagueSeasonById(
    dbPicksLeagueSeason.sportLeagueSeasonId,
  );
  if (!dbSportLeagueSeason) {
    return (
      <ErrorComponent message="League season not found. Please return to your dashboard." />
    );
  }

  const headerList = await headers();
  const pathname = headerList.get("x-current-path");

  let selectedWeekId: string | null = null;
  const searchParamWeekIdParsed = z
    .string()
    .trim()
    .uuid()
    .safeParse(searchParams["weekId"]);
  if (searchParamWeekIdParsed.success) {
    selectedWeekId = searchParamWeekIdParsed.data;
  }

  const tabs = MEMBER_PICKS_LEAGUE_TABS;

  let selectedTabId = PicksLeagueTabIds.MEMBERS;
  let selectedTabContent = <>Default (should not happen)</>;
  if (
    pathname?.startsWith(
      `/picks-leagues/${picksLeagueId}/${PicksLeagueTabIds.MEMBERS}`,
    )
  ) {
    const dbLeagueMemberDetails = await getDBPicksLeagueMemberDetails(
      dbPicksLeagueWithUserRole.id,
    );
    const leagueIsInSeason = seasonType === "current";
    const invites = await getOutstandingDBPicksLeagueInvitesWithUser(
      dbPicksLeagueWithUserRole.id,
    );

    selectedTabContent = (
      <PicksLeagueMembersTab
        dbUser={dbUser}
        dbLeagueWithUserRole={dbPicksLeagueWithUserRole}
        dbLeagueMemberDetails={dbLeagueMemberDetails}
        leagueIsInSeason={leagueIsInSeason}
        outstandingInvites={invites}
      />
    );
  } else if (
    pathname?.startsWith(
      `/picks-leagues/${picksLeagueId}/${PicksLeagueTabIds.MY_PICKS}`,
    )
  ) {
    selectedTabId = PicksLeagueTabIds.MY_PICKS;
    selectedTabContent = (
      <PicksLeagueMyPicksTab
        dbPicksLeague={dbPicksLeagueWithUserRole}
        dbPicksLeagueSeason={dbPicksLeagueSeason}
        seasonType={seasonType}
        selectedWeekId={selectedWeekId}
        dbUser={dbUser}
      />
    );
  } else if (
    pathname?.startsWith(
      `/picks-leagues/${picksLeagueId}/${PicksLeagueTabIds.LEAGUE_PICKS}`,
    )
  ) {
    selectedTabId = PicksLeagueTabIds.LEAGUE_PICKS;
    selectedTabContent = (
      <LeaguePicksTab
        dbPicksLeague={dbPicksLeagueWithUserRole}
        dbPicksLeagueSeason={dbPicksLeagueSeason}
        seasonType={seasonType}
        selectedWeekId={selectedWeekId}
        dbUser={dbUser}
      />
    );
  } else if (
    pathname?.startsWith(
      `/picks-leagues/${picksLeagueId}/${PicksLeagueTabIds.LEAGUE_SETTINGS}`,
    )
  ) {
    selectedTabId = PicksLeagueTabIds.LEAGUE_SETTINGS;
    selectedTabContent = (
      <PicksLeagueSettingsTab
        readonly={
          dbPicksLeagueWithUserRole.role !== PicksLeagueMemberRoles.COMMISSIONER
        }
        dbPicksLeague={dbPicksLeagueWithUserRole}
        dbPicksLeagueSeason={dbPicksLeagueSeason}
      />
    );
  } else if (
    pathname?.startsWith(
      `/picks-leagues/${picksLeagueId}/${PicksLeagueTabIds.STANDINGS}`,
    )
  ) {
    selectedTabId = PicksLeagueTabIds.STANDINGS;
    selectedTabContent = (
      <PicksLeagueStandingsTab
        dbUser={dbUser}
        dbPicksLeagueSeason={dbPicksLeagueSeason}
        seasonType={seasonType}
      />
    );
  } else {
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
            {dbPicksLeagueWithUserRole.pickType} • {dbSportLeagueSeason.name}
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

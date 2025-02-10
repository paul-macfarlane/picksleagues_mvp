import { auth } from "@/auth";
import ErrorPage from "@/components/error-page";
import { getDBUserById } from "@/db/users";
import { withDBTransaction } from "@/db/transactions";
import { getPicksLeagueHomeUrl } from "@/models/picksLeagues";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createDBPicksLeagueMember,
  getDBPicksLeagueMember,
} from "@/db/picksLeagueMembers";
import {
  acceptDBPicksLeagueInvite,
  getDBPicksLeagueDetailsForInvite,
} from "@/db/picksLeagueInvite";
import { AUTH_URL } from "@/models/auth";
import { getNextDBPicksLeagueSeason } from "@/db/picksLeagueSeasons";
import { upsertDBPicksLeagueStandings } from "@/db/picksLeagueStandings";

export default async function InvitesPage(props: {
  params: Promise<{ id: unknown }>;
}) {
  const params = await props.params;
  const parseInviteId = z.string().uuid().safeParse(params.id);
  if (!parseInviteId.success) {
    return (
      <ErrorPage
        title="Error"
        description={"Invalid Invite Url"}
        buttonProps={{
          link: "/dashboard",
          text: "Back to Dashboard",
        }}
      />
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return (
      <ErrorPage
        title="Please Sign In"
        content={
          <div className="space-y-2">
            <span>Sign into PicksLeagues in order to accept the invite.</span>
            <ul className="list-disc px-8">
              <li>
                If you are signing up for the first time, you will set up your
                profile and then will join the league.
              </li>
              <li>
                If you already have an account, you will join the league after
                signing in.
              </li>
            </ul>
          </div>
        }
        buttonProps={{
          link: `${AUTH_URL}?inviteId=${parseInviteId.data}`,
          text: "Sign in",
        }}
      />
    );
  }

  const dbUser = await getDBUserById(session.user.id);
  if (!dbUser) {
    console.error(
      `User with id ${session.user.id} from session not found in db while joining league`,
    );

    return (
      <ErrorPage
        title="Error"
        description="An unexpected error occured"
        buttonProps={{
          link: "/dashboard",
          text: "Back to Dashboard",
        }}
      />
    );
  }

  const dbLeagueWithInvite = await getDBPicksLeagueDetailsForInvite(
    parseInviteId.data,
  );
  if (!dbLeagueWithInvite) {
    return (
      <ErrorPage
        title="Error"
        description="League not found"
        buttonProps={{
          link: "/dashboard",
          text: "Back to Dashboard",
        }}
      />
    );
  }

  if (dbLeagueWithInvite.memberCount >= dbLeagueWithInvite.size) {
    return (
      <ErrorPage
        title="Error"
        description="League cannot be joined because it is full"
        buttonProps={{
          link: "/dashboard",
          text: "Back to Dashboard",
        }}
      />
    );
  }

  if (new Date() > dbLeagueWithInvite.invite.expiresAt) {
    return (
      <ErrorPage
        title="Error"
        description="Invite Expired"
        buttonProps={{
          link: "/dashboard",
          text: "Back to Dashboard",
        }}
      />
    );
  }

  const dbPicksLeagueSeason = await getNextDBPicksLeagueSeason(
    dbLeagueWithInvite.id,
  );

  const existingLeagueMember = await getDBPicksLeagueMember(
    dbLeagueWithInvite.id,
    dbUser.id,
  );
  if (!existingLeagueMember) {
    const createDBLeagueMemberData = {
      userId: dbUser.id,
      leagueId: dbLeagueWithInvite.id,
      role: dbLeagueWithInvite.invite.role,
    };
    try {
      await withDBTransaction(async (tx) => {
        await acceptDBPicksLeagueInvite(
          dbUser.id,
          dbLeagueWithInvite.invite.id,
          tx,
        );

        const dbLeagueMember = await createDBPicksLeagueMember(
          createDBLeagueMemberData,
          tx,
        );
        if (!dbLeagueMember) {
          console.error(
            "Unable to create league member with ",
            createDBLeagueMemberData,
          );

          throw new Error("Unable to create league member");
        }

        if (dbPicksLeagueSeason) {
          await upsertDBPicksLeagueStandings(
            [
              {
                userId: dbUser.id,
                seasonId: dbPicksLeagueSeason.id,
                wins: 0,
                losses: 0,
                pushes: 0,
                points: 0,
                rank: 1, // users can't join mid-season so can assume a tie for first
              },
            ],
            tx,
          );
        }
      });
    } catch (e: unknown) {
      console.error(
        "Unable to create league member with ",
        createDBLeagueMemberData,
        e,
      );

      return (
        <ErrorPage
          title="Error"
          description="An unexpected error occured joining the league, please try again later"
          buttonProps={{
            link: "/dashboard",
            text: "Back to Dashboard",
          }}
        />
      );
    }
  }

  return redirect(getPicksLeagueHomeUrl(dbLeagueWithInvite.id));
}

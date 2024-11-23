import { auth } from "@/auth";
import ErrorPage from "@/components/error-page";
import {
  createDBLeagueMember,
  getLeagueDetailsForInvite,
  getDBLeagueMember,
  accceptDBLeagueInvite,
} from "@/db/leagues";
import { getDBUserById } from "@/db/users";
import { withTransaction } from "@/db/util";
import { getLeagueHomeUrl, LeagueMemberRoles } from "@/models/leagues";
import { redirect } from "next/navigation";
import { z } from "zod";

export default async function InvitesPage({
  params,
}: {
  params: { id: unknown };
}) {
  const parseInviteId = z.string().uuid().safeParse(params.id);
  if (!parseInviteId.success) {
    return (
      <ErrorPage
        title="Error"
        description={"Invalid Invite Url"}
        buttonProps={{
          link: "/dashboard",
          text: "Back to Dashbaord",
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
          link: `/auth?inviteId=${parseInviteId.data}`,
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
        description="An unexpected error occured.s"
        buttonProps={{
          link: "/dashboard",
          text: "Back to Dashbaord",
        }}
      />
    );
  }

  const dbLeague = await getLeagueDetailsForInvite(parseInviteId.data);
  if (!dbLeague) {
    return (
      <ErrorPage
        title="Error"
        description="League not found"
        buttonProps={{
          link: "/dashboard",
          text: "Back to Dashbaord",
        }}
      />
    );
  }

  if (dbLeague.memberCount >= dbLeague.size) {
    return (
      <ErrorPage
        title="Error"
        description="League cannot be joined because it is full"
        buttonProps={{
          link: "/dashboard",
          text: "Back to Dashbaord",
        }}
      />
    );
  }

  if (
    new Date() > dbLeague.invite.expiresAt ||
    (dbLeague.invite.acceptedByUserId &&
      dbLeague.invite.acceptedByUserId !== session.user.id)
  ) {
    return (
      <ErrorPage
        title="Error"
        description="Invite Expired"
        buttonProps={{
          link: "/dashboard",
          text: "Back to Dashbaord",
        }}
      />
    );
  }

  const existingLeagueMember = await getDBLeagueMember(dbLeague.id, dbUser.id);
  if (!existingLeagueMember) {
    const createDBLeagueMemberData = {
      userId: dbUser.id,
      leagueId: dbLeague.id,
      role: LeagueMemberRoles.MEMBER,
    };
    try {
      await withTransaction(async (tx) => {
        await accceptDBLeagueInvite(dbUser.id, dbLeague.invite.id, tx);

        const dbLeagueMember = await createDBLeagueMember(
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
            text: "Back to Dashbaord",
          }}
        />
      );
    }
  }

  return redirect(getLeagueHomeUrl(dbLeague.id));
}

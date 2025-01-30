import { DBPicksLeagueWithUserRole } from "@/db/picksLeagues";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PicksLeagueInviteDialog } from "./invite-dialog";
import { Users } from "lucide-react";
import { getDBPicksLeagueMemberDetails } from "@/db/picksLeagueMembers";
import { picksLeagueIsInSeason } from "@/services/picksLeagues";
import { PicksLeagueMemberRoles } from "@/models/picksLeagueMembers";

export async function PicksLeagueMembersTab({
  dbLeagueWithUserRole,
}: {
  dbLeagueWithUserRole: DBPicksLeagueWithUserRole;
}) {
  const dbLeagueMemberDetails = await getDBPicksLeagueMemberDetails(
    dbLeagueWithUserRole.id,
  );

  let canSendInvite = false;
  if (
    dbLeagueWithUserRole.role === PicksLeagueMemberRoles.COMMISSIONER &&
    dbLeagueMemberDetails.length < dbLeagueWithUserRole.size
  ) {
    const leagueIsInSeason = await picksLeagueIsInSeason(
      dbLeagueWithUserRole.id,
    );
    canSendInvite = !leagueIsInSeason;
  }

  return (
    <>
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>League Members</CardTitle>
        </CardHeader>

        <CardContent>
          <ul className="space-y-4">
            {dbLeagueMemberDetails.map((member) => (
              <li key={member.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage
                      src={member.image ?? undefined}
                      alt={member.username!}
                    />
                    <AvatarFallback>
                      {member
                        .username!.split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {member.username} ({member.firstName} {member.lastName})
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {member.role}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {canSendInvite && (
            <PicksLeagueInviteDialog leagueId={dbLeagueWithUserRole.id} />
          )}
        </CardContent>
      </Card>

      <Card className="mx-auto mt-2 w-full max-w-4xl md:mt-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {dbLeagueMemberDetails.length} / {dbLeagueWithUserRole.size}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

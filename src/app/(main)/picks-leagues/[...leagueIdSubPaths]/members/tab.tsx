"use client";

import { DBPicksLeagueWithUserRole } from "@/db/picksLeagues";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PicksLeagueInviteDialog } from "./invite-dialog";
import { UserPen, Users } from "lucide-react";
import { DBPicksLeagueMemberDetails } from "@/db/picksLeagueMembers";
import { PicksLeagueMemberRoles } from "@/models/picksLeagueMembers";
import { MemberRoleSwitcher } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/members/member-role-switcher";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RemoveMemberDialogue } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/members/remove-member-dialogue";
import { LeaveLeagueDialogue } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/members/leave-league-dialogue";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

export interface PicksLeagueMembersTabProps {
  userId: string;
  dbLeagueWithUserRole: DBPicksLeagueWithUserRole;
  dbLeagueMemberDetails: DBPicksLeagueMemberDetails[];
  leagueIsInSeason: boolean;
}

export function PicksLeagueMembersTab({
  userId,
  dbLeagueWithUserRole,
  dbLeagueMemberDetails,
  leagueIsInSeason,
}: PicksLeagueMembersTabProps) {
  const [memberDetails, setMemberDetails] = useState(dbLeagueMemberDetails);
  const commissionerCount = memberDetails.filter(
    (member) => member.role === PicksLeagueMemberRoles.COMMISSIONER,
  ).length;

  const canSendInvite =
    dbLeagueWithUserRole.role === PicksLeagueMemberRoles.COMMISSIONER &&
    memberDetails.length < dbLeagueWithUserRole.size &&
    !leagueIsInSeason;
  const canRemoveUser = (memberUserId: string) =>
    !leagueIsInSeason &&
    dbLeagueWithUserRole.role === PicksLeagueMemberRoles.COMMISSIONER &&
    memberUserId !== userId;

  // note also leave league dialogue will not even be visible while in season
  let canLeaveLeague =
    dbLeagueWithUserRole.role !== PicksLeagueMemberRoles.COMMISSIONER;
  let cannotLeaveLeagueReason = "";
  if (!canLeaveLeague) {
    const otherCommissioners = memberDetails.filter(
      (member) =>
        member.id !== userId &&
        member.role === PicksLeagueMemberRoles.COMMISSIONER,
    );
    canLeaveLeague = otherCommissioners.length > 0;
    if (!canLeaveLeague) {
      cannotLeaveLeagueReason =
        "You cannot leave the league until at least one other league member is made a commissioner";
    }
  }

  return (
    <>
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>League Members</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <ul className="space-y-4">
            {memberDetails.map((member) => (
              <li key={member.id} className="flex items-center justify-between">
                <div className="flex w-full items-center gap-2">
                  <Avatar className={"hidden md:block"}>
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

                  {dbLeagueWithUserRole.role ===
                  PicksLeagueMemberRoles.COMMISSIONER ? (
                    <div className="md:text-md flex w-full items-center justify-between gap-2 text-sm">
                      <span className="font-medium">
                        {member.username} ({member.firstName} {member.lastName})
                      </span>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="secondary">
                            <UserPen /> Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Member</DialogTitle>
                            <DialogDescription></DialogDescription>
                          </DialogHeader>

                          <div className="flex w-full flex-col gap-2">
                            <MemberRoleSwitcher
                              currentUserId={userId}
                              member={member}
                              picksLeagueId={dbLeagueWithUserRole.id}
                              commissionerCount={commissionerCount}
                              onRoleChange={(newRole) => {
                                setMemberDetails(
                                  memberDetails.map((m) =>
                                    m.id === member.id
                                      ? { ...m, role: newRole }
                                      : m,
                                  ),
                                );
                              }}
                            />

                            <div className="flex w-full items-center justify-between">
                              <span className="text-sm">Remove Member</span>

                              <RemoveMemberDialogue
                                disabled={!canRemoveUser(member.id)}
                                memberUserId={member.id}
                                picksLeagueId={dbLeagueWithUserRole.id}
                              />
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ) : (
                    <div className="md:text-md text-sm">
                      <p className="font-medium">
                        {member.username} ({member.firstName} {member.lastName})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.role}
                      </p>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {canSendInvite && (
            <PicksLeagueInviteDialog leagueId={dbLeagueWithUserRole.id} />
          )}

          {!leagueIsInSeason && (
            <>
              <Separator />

              <LeaveLeagueDialogue
                picksLeagueId={dbLeagueWithUserRole.id}
                canLeaveLeague={canLeaveLeague}
                cannotLeaveLeagueReason={cannotLeaveLeagueReason}
              />
            </>
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
            {memberDetails.length} / {dbLeagueWithUserRole.size}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

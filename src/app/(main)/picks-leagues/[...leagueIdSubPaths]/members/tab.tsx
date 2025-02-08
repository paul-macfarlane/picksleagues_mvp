"use client";

import { DBPicksLeagueWithUserRole } from "@/db/picksLeagues";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PicksLeagueInviteDialog } from "./invite-dialog";
import { ArrowUpDown, UserPen, Users } from "lucide-react";
import { DBPicksLeagueMemberDetails } from "@/db/picksLeagueMembers";
import { PicksLeagueMemberRoles } from "@/models/picksLeagueMembers";
import { MemberRoleSwitcher } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/members/member-role-switcher";
import { RemoveMemberDialogue } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/members/remove-member-dialogue";
import { LeaveLeagueDialogue } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/members/leave-league-dialogue";
import { DataTable } from "@/components/ui/data-table";
import { Column, ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { Button } from "@/components/ui/button";

function TableHeader({
  column,
  name,
}: {
  column: Column<DBPicksLeagueMemberDetails, unknown>;
  name: string;
}) {
  return (
    <Button
      className="-ml-2 px-1"
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {name}
      <ArrowUpDown className="h-4 w-4" />
    </Button>
  );
}

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

  const columns: ColumnDef<DBPicksLeagueMemberDetails>[] = [
    {
      accessorKey: "username",
      header: ({ column }) => TableHeader({ column, name: "Member" }),
      cell: ({ row }) => {
        const member = row.original;
        return (
          <div className="flex items-center gap-2">
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

            <span>
              {member.username} ({member.firstName}){" "}
            </span>
          </div>
        );
      },
    },
    {
      id: "role",
      accessorKey: "role",
      header: ({ column }) => TableHeader({ column, name: "Role" }),
      cell: ({ row }) => {
        const member = row.original;
        return dbLeagueWithUserRole.role ===
          PicksLeagueMemberRoles.COMMISSIONER ? (
          <MemberRoleSwitcher
            currentUserId={userId}
            picksLeagueId={dbLeagueWithUserRole.id}
            member={member}
            commissionerCount={commissionerCount}
            onRoleChange={(newRole) => {
              setMemberDetails(
                memberDetails.map((m) =>
                  m.id === member.id ? { ...m, role: newRole } : m,
                ),
              );
            }}
          />
        ) : (
          <span>{member.role}</span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const member = row.original;
        return (
          <div className="">
            {canRemoveUser(member.id) && (
              <RemoveMemberDialogue
                disabled={!canRemoveUser(member.id)}
                memberUserId={member.id}
                picksLeagueId={dbLeagueWithUserRole.id}
              />
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>League Members</CardTitle>
          {canSendInvite && (
            <PicksLeagueInviteDialog leagueId={dbLeagueWithUserRole.id} />
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <DataTable columns={columns} data={memberDetails} />
        </CardContent>
      </Card>

      <Card className="mx-auto mt-6 w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Total Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Users className="h-4 w-4 opacity-70" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {memberDetails.length} / {dbLeagueWithUserRole.size}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!leagueIsInSeason && (
        <Card className="mx-auto mt-6 w-full max-w-4xl">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Leave League</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <UserPen className="h-4 w-4 opacity-70" />
                <div className="space-y-1">
                  <LeaveLeagueDialogue
                    picksLeagueId={dbLeagueWithUserRole.id}
                    canLeaveLeague={canLeaveLeague}
                    cannotLeaveLeagueReason={cannotLeaveLeagueReason}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PICKS_LEAGUE_MEMBER_ROLES_VALUES,
  PicksLeagueMemberRoles,
} from "@/models/picksLeagueMembers";
import { DBPicksLeagueMemberDetails } from "@/db/picksLeagueMembers";
import { useToast } from "@/hooks/use-toast";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

export interface MemberRoleSwitcherProps {
  currentUserId: string;
  picksLeagueId: string;
  member: DBPicksLeagueMemberDetails;
  commissionerCount: number;
  onRoleChange: (newRole: PicksLeagueMemberRoles) => void;
}

export function MemberRoleSwitcher({
  currentUserId,
  picksLeagueId,
  member,
  commissionerCount,
  onRoleChange,
}: MemberRoleSwitcherProps) {
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingRole, setPendingRole] = useState<string | null>(null);
  const { toast } = useToast();

  const isOnlyCommissioner =
    member.role === PicksLeagueMemberRoles.COMMISSIONER &&
    commissionerCount === 1;
  const isCurrentUser = member.id === currentUserId;

  const handleRoleChange = async (value: string) => {
    if (
      isCurrentUser &&
      member.role === PicksLeagueMemberRoles.COMMISSIONER &&
      value === PicksLeagueMemberRoles.MEMBER
    ) {
      setPendingRole(value);
      setShowConfirmDialog(true);
      return;
    }

    await updateRole(value);
  };

  const updateRole = async (value: string): Promise<boolean> => {
    let success = false;
    try {
      setSubmitting(true);

      await axios.patch(
        `${process.env.NEXT_PUBLIC_HOST!}/api/picks-leagues/${picksLeagueId}/roles`,
        {
          memberId: member.id,
          role: value,
        },
      );

      onRoleChange(value as PicksLeagueMemberRoles);

      toast({
        title: "Success!",
        description: "Member role updated successfully.",
      });
      success = true;
    } catch (e) {
      let description = "An unexpected error occurred, please try again later.";
      if (e instanceof AxiosError && e.response?.data.error) {
        description = e.response.data.error;
      }

      toast({
        variant: "destructive",
        title: "Error",
        description,
      });
    } finally {
      setSubmitting(false);
      setPendingRole(null);

      return success;
    }
  };

  const router = useRouter();

  const handleConfirmRoleChange = async () => {
    if (pendingRole) {
      const success = await updateRole(pendingRole);
      if (success) {
        router.refresh(); // refresh page with updated role
      }
    }
    setShowConfirmDialog(false);
  };

  return (
    <>
      <Select onValueChange={handleRoleChange} defaultValue={member.role}>
        <SelectTrigger
          className="w-[150px] sm:w-[180px]"
          disabled={submitting || (isCurrentUser && isOnlyCommissioner)}
        >
          <SelectValue placeholder="Select a role" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {PICKS_LEAGUE_MEMBER_ROLES_VALUES.filter(
              (role) => role !== PicksLeagueMemberRoles.NONE,
            ).map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Commissioner Privileges?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                By changing your role to Member, you will:
                <ul className="mt-2 list-inside list-disc">
                  <li>No longer be able to edit league roles</li>
                  <li>No longer be able to edit league settings</li>
                  <li>
                    Need another commissioner to restore your commissioner role
                  </li>
                </ul>
                Are you sure you want to continue?
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRoleChange}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

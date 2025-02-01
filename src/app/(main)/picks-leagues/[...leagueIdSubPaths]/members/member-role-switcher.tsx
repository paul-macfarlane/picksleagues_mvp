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

export interface MemberRoleSwitcherProps {
  currentUserId: string;
  picksLeagueId: string;
  member: DBPicksLeagueMemberDetails;
}

export function MemberRoleSwitcher({
  currentUserId,
  picksLeagueId,
  member,
}: MemberRoleSwitcherProps) {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const onChangeRole = async (value: string) => {
    try {
      setSubmitting(true);

      await axios.patch(
        `${process.env.NEXT_PUBLIC_HOST!}/api/picks-leagues/${picksLeagueId}/roles`,
        {
          memberId: member.id,
          role: value,
        },
      );

      toast({
        title: "Success!",
        description: "Member role updated successfully.",
      });
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
    }

    setSubmitting(false);
  };

  return (
    <Select onValueChange={onChangeRole} defaultValue={member.role}>
      <SelectTrigger
        className="w-[150px] md:w-[180px]"
        disabled={member.id === currentUserId || submitting}
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
  );
}

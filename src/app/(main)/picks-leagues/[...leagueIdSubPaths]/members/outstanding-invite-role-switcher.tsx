"use client";

import { PicksLeagueMemberRoles } from "@/models/picksLeagueMembers";
import { useState } from "react";
import { DBPicksLeagueInviteWithUser } from "@/db/picksLeagueInvite";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import axios, { AxiosError } from "axios";

export function OutstandingInviteRoleSwitcher({
  invite,
}: {
  invite: DBPicksLeagueInviteWithUser;
}) {
  const { toast } = useToast();
  const [updatingInvite, setUpdatingInvite] = useState(false);
  const [role, setRole] = useState(invite.role);

  return (
    <Select
      value={role}
      disabled={updatingInvite}
      onValueChange={async (value: PicksLeagueMemberRoles) => {
        try {
          setUpdatingInvite(true);
          await axios.patch(`/api/invites/${invite.id}`, {
            role: value,
          });

          toast({
            title: "Success!",
            description: "Invite role updated successfully.",
          });

          setRole(value);
          setUpdatingInvite(false);
        } catch (e) {
          setUpdatingInvite(false);
          let description =
            "An unexpected error occurred, please try again later.";
          if (e instanceof AxiosError && e.response?.data.error) {
            description = e.response.data.error;
          }

          toast({
            title: "Error",
            description,
            variant: "destructive",
          });
        } finally {
          setUpdatingInvite(false);
        }
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={PicksLeagueMemberRoles.MEMBER}>
          {PicksLeagueMemberRoles.MEMBER}
        </SelectItem>
        <SelectItem value={PicksLeagueMemberRoles.COMMISSIONER}>
          {PicksLeagueMemberRoles.COMMISSIONER}
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

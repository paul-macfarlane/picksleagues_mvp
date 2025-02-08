"use client";

import { Button } from "@/components/ui/button";
import { DBPicksLeaguePendingInvite } from "@/db/picksLeagueInvite";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

export function InviteActions({
  invite,
}: {
  invite: DBPicksLeaguePendingInvite;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleAccept = async () => {
    try {
      setIsLoading(true);

      await axios.post(
        `${process.env.NEXT_PUBLIC_HOST!}/api/invites/${invite.id}/accept`,
      );

      router.push(`/picks-leagues/${invite.leagueId}/members`);
    } catch (error) {
      setIsLoading(false);

      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleDecline = async () => {
    try {
      setIsLoading(true);

      await axios.post(
        `${process.env.NEXT_PUBLIC_HOST!}/api/invites/${invite.id}/decline`,
      );

      router.refresh();
    } catch (error) {
      setIsLoading(false);

      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={handleAccept} disabled={isLoading}>
        Accept
      </Button>

      <Button
        variant="destructive"
        size="sm"
        onClick={handleDecline}
        disabled={isLoading}
      >
        Decline
      </Button>
    </div>
  );
}

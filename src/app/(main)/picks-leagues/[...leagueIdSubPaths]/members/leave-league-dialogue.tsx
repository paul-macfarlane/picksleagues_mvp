"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useState } from "react";
import axios, { AxiosError } from "axios";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export interface LeaveLeagueDialogueProps {
  canLeaveLeague: boolean;
  cannotLeaveLeagueReason?: string;
  picksLeagueId: string;
}

export function LeaveLeagueDialogue({
  canLeaveLeague,
  cannotLeaveLeagueReason,
  picksLeagueId,
}: LeaveLeagueDialogueProps) {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const onLeaveLeague = async () => {
    try {
      setSubmitting(true);

      await axios.delete(
        `${process.env.NEXT_PUBLIC_HOST!}/api/picks-leagues/${picksLeagueId}/members/leave`,
      );

      toast({
        title: "League Left!",
        description: "You have left the league.",
      });
      router.push(`/dashboard`);
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

      setSubmitting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <LogOut /> Leave League
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          {canLeaveLeague && (
            <>
              {" "}
              <AlertDialogTitle>
                Are you sure you want to leave this league?
              </AlertDialogTitle>
              <AlertDialogDescription>
                You will be removed from the league and no longer be able view
                league data or make picks. Your historical standings and picks
                will be retained within the league.
              </AlertDialogDescription>
            </>
          )}

          {!canLeaveLeague && (
            <>
              <AlertDialogTitle>Cannot leave league</AlertDialogTitle>
              <AlertDialogDescription>
                {cannotLeaveLeagueReason}
              </AlertDialogDescription>
            </>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          {canLeaveLeague && (
            <>
              <AlertDialogCancel disabled={submitting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={onLeaveLeague} disabled={submitting}>
                Leave
              </AlertDialogAction>
            </>
          )}

          {!canLeaveLeague && <AlertDialogCancel>Ok</AlertDialogCancel>}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

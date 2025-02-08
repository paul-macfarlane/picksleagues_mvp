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
import { UserMinus } from "lucide-react";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export interface RemoveMemberDialogueProps {
  disabled: boolean;
  memberUserId: string;
  picksLeagueId: string;
}

export function RemoveMemberDialogue({
  disabled,
  memberUserId,
  picksLeagueId,
}: RemoveMemberDialogueProps) {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const onRemoveMember = async () => {
    try {
      setSubmitting(true);

      await axios.delete(
        `${process.env.NEXT_PUBLIC_HOST!}/api/picks-leagues/${picksLeagueId}/members/${memberUserId}`,
      );

      toast({
        title: "Member Removed!",
        description: "Picks League Member Removed.",
      });

      window.location.reload(); // router didn't refresh, window did
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
        <Button disabled={disabled} variant="destructive">
          <UserMinus /> Remove
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to remove this member?
          </AlertDialogTitle>
          <AlertDialogDescription>
            The member will be removed from the league and no longer be able
            view league data or make picks. The member&#39;s historical
            standings and picks will be retained.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onRemoveMember} disabled={submitting}>
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

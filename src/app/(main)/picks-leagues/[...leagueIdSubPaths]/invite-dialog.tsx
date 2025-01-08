"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRef, useState, useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { z } from "zod";
import { picksLeagueInviteFormAction } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/invite-action";
import { PicksLeagueInviteFormSchema } from "@/models/picksLeagueInvites";

type FormSchema = z.infer<typeof PicksLeagueInviteFormSchema>;

export function InviteDialog({ leagueId }: { leagueId: string }) {
  const [inviteLink, setInviteLink] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [error, setError] = useState("");

  const copyInviteLink = () => {
    void navigator.clipboard.writeText(inviteLink);
    setLinkCopied(true);
  };

  const [formState, formAction] = useActionState(
    picksLeagueInviteFormAction,
    {},
  );
  const form = useForm<FormSchema>({
    resolver: zodResolver(PicksLeagueInviteFormSchema),
  });
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Form {...form}>
      <form
        ref={formRef}
        action={formAction}
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(async () => {
            const actionResponse = await picksLeagueInviteFormAction(
              formState,
              new FormData(formRef.current!),
            );

            if (actionResponse?.errors) {
              if (actionResponse?.errors?.leagueId) {
                form.setError("leagueId", {
                  type: "custom",
                  message: actionResponse.errors.leagueId,
                });
              }

              return;
            }

            if (!actionResponse?.inviteUrl) {
              setError("An unexpected error occurred. Please try again later.");

              return;
            }

            setError("");
            setInviteLink(actionResponse.inviteUrl);
          })(e);
        }}
      >
        <input
          {...form.register("leagueId")}
          name="leagueId"
          type="hidden"
          value={leagueId}
        />

        <Dialog>
          <DialogTrigger asChild>
            <Button
              type="submit"
              onClick={() => setLinkCopied(false)}
              className="mt-4 w-full"
            >
              <Link className="mr-2 h-4 w-4" />
              Generate Invite Link
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-xs md:max-w-lg">
            <DialogHeader>
              <DialogTitle>Invite New Member</DialogTitle>
              <DialogDescription>
                Copy the invite link to share with potential new members.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center gap-4">
              {inviteLink ? (
                <>
                  <Input value={inviteLink} readOnly />
                  {linkCopied ? (
                    <Button type="button">Link Copied!</Button>
                  ) : (
                    <Button type="button" onClick={copyInviteLink}>
                      <Link className="h-4 w-4" />
                      Copy Invite Link
                    </Button>
                  )}
                </>
              ) : (
                <>
                  {form.formState.errors.leagueId ? (
                    <span className="text-sm text-destructive">
                      {form.formState.errors.leagueId.message}
                    </span>
                  ) : (
                    <></>
                  )}

                  {error ? (
                    <span className="text-sm text-destructive">{error}</span>
                  ) : (
                    <></>
                  )}
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </form>
    </Form>
  );
}

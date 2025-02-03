"use client";

import { joinLeagueAction } from "./join-league-action";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { useRef, useActionState } from "react";
import { DBPicksLeagueDetailsWithWeek } from "@/db/picksLeagues";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { isUrl } from "@/shared/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { JoinPicksLeagueSchema } from "@/models/picksLeagueInvites";

type FormSchema = z.infer<typeof JoinPicksLeagueSchema>;

export function JoinLeagueForm({
  league,
}: {
  league: DBPicksLeagueDetailsWithWeek;
}) {
  const router = useRouter();

  const [formState, formAction] = useActionState(joinLeagueAction, {});
  const form = useForm<FormSchema>({
    resolver: zodResolver(JoinPicksLeagueSchema),
  });
  const { pending } = useFormStatus();

  const formRef = useRef<HTMLFormElement>(null);

  const { toast } = useToast();

  return (
    <Form {...form}>
      <form
        className="h-full"
        ref={formRef}
        action={formAction}
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(async () => {
            const actionResponse = await joinLeagueAction(
              formState,
              new FormData(formRef.current!),
            );

            if (actionResponse?.errors) {
              toast({
                variant: "destructive",
                title: "Error",
                description:
                  "An unexpected error occurred, please try again later.",
              });

              return;
            }

            toast({
              title: "League Joined!",
              description: "Welcome to the League!",
            });

            router.push("/");
          })(e);
        }}
      >
        <Card key={league.id} className="flex h-full flex-col justify-between">
          <input
            type="hidden"
            {...form.register("leagueId")}
            value={league.id}
          ></input>

          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={
                    league.logoUrl && isUrl(league.logoUrl)
                      ? league.logoUrl
                      : undefined
                  }
                  alt={league.name}
                />
                <AvatarFallback>{league.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{league.name}</CardTitle>
                <CardDescription>
                  {league.sportLeagueAbbreviation}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p>Pick type: {league.pickType}</p>
            <p>Start week: {league.startSportLeagueWeekName}</p>
            <p>End week: {league.endSportLeagueWeekName}</p>
            <p>Picks per week: {league.picksPerWeek}</p>
            <p>
              Members: {league.memberCount}/{league.size}
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button disabled={pending} type="submit" className="w-full">
              Join League
            </Button>

            {(formState.errors?.form ?? formState.errors?.leagueId ?? "") ? (
              <p className="text-sm font-medium text-destructive">
                {formState.errors?.form ?? formState.errors?.leagueId ?? ""}
              </p>
            ) : (
              <></>
            )}
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

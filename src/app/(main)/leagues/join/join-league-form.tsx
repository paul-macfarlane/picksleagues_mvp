"use client";

import { joinLeagueAction } from "./join-league-action";
import { JoinLeagueSchema } from "@/models/leagues";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import { useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { useRef } from "react";
import { DBLeagueDetailsWithWeek } from "@/db/leagues";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { isUrl } from "@/lib/utils";
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

type FormSchema = z.infer<typeof JoinLeagueSchema>;

function FormContent({
  form,
  league,
  errorMessage,
}: {
  form: UseFormReturn<FormSchema>;
  league: DBLeagueDetailsWithWeek;
  errorMessage?: string;
}) {
  const { pending } = useFormStatus();

  return (
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
                league.logoUrl && isUrl(league.logoUrl) ? league.logoUrl : ""
              }
              alt={league.name}
            />
            <AvatarFallback>{league.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{league.name}</CardTitle>
            <CardDescription>{league.sportLeagueAbbreviation}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p>Pick type: {league.pickType}</p>
        <p>Start week: {league.startWeekName}</p>
        <p>End week: {league.endWeekName}</p>
        <p>Picks per week: {league.picksPerWeek}</p>
        <p>
          Members: {league.memberCount}/{league.size}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button disabled={pending} type="submit" className="w-full">
          Join League
        </Button>

        {errorMessage ? (
          <p className="text-sm font-medium text-destructive">{errorMessage}</p>
        ) : (
          <></>
        )}
      </CardFooter>
    </Card>
  );
}

export function JoinLeagueForm({
  league,
}: {
  league: DBLeagueDetailsWithWeek;
}) {
  const router = useRouter();

  const [formState, formAction] = useFormState(joinLeagueAction, {});
  const form = useForm<FormSchema>({
    resolver: zodResolver(JoinLeagueSchema),
  });

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
              if (actionResponse?.errors?.leagueId) {
                form.setError("leagueId", {
                  type: "custom",
                  message: actionResponse.errors.leagueId,
                });
              }

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
        <FormContent
          form={form}
          league={league}
          errorMessage={
            formState.errors?.form ?? formState.errors?.leagueId ?? ""
          }
        />
      </form>
    </Form>
  );
}

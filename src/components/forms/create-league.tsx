"use client";

import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DBSportWeek, DBSportWithActiveSeasonDetail } from "@/db/sports";
import { useFormState, useFormStatus } from "react-dom";
import {
  CreateLeagueSchema,
  DEFAULT_LEAGUE_SIZE,
  DEFAULT_PICKS_PER_WEEK,
  LEAGUE_VISIBILITY_VALUES,
  LeagueVisibilities,
  PICK_TYPE_VALUES,
  PickTypes,
} from "@/models/leagues";
import { z } from "zod";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createLeagueAction } from "@/actions/leagues";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useRef, useState } from "react";
import { isUrl } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";

type FormSchema = z.infer<typeof CreateLeagueSchema>;

function getDefaultSportStartWeekId(
  sport: DBSportWithActiveSeasonDetail,
): string {
  return sport.season.weeks.length
    ? (
        sport.season.weeks.find((week) => week.defaultStart) ??
        sport.season.weeks[0]
      ).id
    : "";
}

function getDefaultSportEndWeekId(
  sport: DBSportWithActiveSeasonDetail,
): string {
  return sport.season.weeks.length
    ? (
        sport.season.weeks.find((week) => week.defaultEnd) ??
        sport.season.weeks[sport.season.weeks.length - 1]
      ).id
    : "";
}

function FormContent({
  form,
  sports,
  defaultSportWeeks,
  defaultStartWeekId,
  defaultEndWeekId,
  errorMessage,
}: {
  form: UseFormReturn<FormSchema>;
  sports: DBSportWithActiveSeasonDetail[];
  defaultSportWeeks: DBSportWeek[];
  defaultStartWeekId: string;
  defaultEndWeekId: string;
  errorMessage: string;
}) {
  const { pending } = useFormStatus();

  const leagueName = form.watch("name");
  const logoUrl = form.watch("logoUrl");

  const [sportWeeks, setSportWeeks] = useState(defaultSportWeeks);
  const [startWeekId, setStartWeekId] = useState(defaultStartWeekId);
  const [endWeekId, setEndWeekId] = useState(defaultEndWeekId);

  return (
    <>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>League Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter league name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="logoUrl"
            render={({ field }) => (
              <FormItem
                className={`flex w-full items-end gap-2 ${form.formState.errors.name ? "items-center" : ""}`}
              >
                <Avatar
                  className={`h-12 w-12 ${form.formState.errors.logoUrl ? "self-center" : ""}`}
                >
                  <AvatarImage
                    src={isUrl(logoUrl) ? logoUrl : ""}
                    alt="League logo"
                  />
                  <AvatarFallback>
                    {leagueName.length ? leagueName.charAt(0) : "L"}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`flex w-full flex-col gap-2 ${form.formState.errors.name ? "self-start" : ""}`}
                >
                  <FormLabel>Logo URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter logo URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sportId"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Sport</FormLabel>
                <Select
                  onValueChange={(val) => {
                    field.onChange(val);

                    const sport = sports.find((sport) => sport.id === val)!;
                    setSportWeeks(sport.season.weeks);

                    const startId = getDefaultSportStartWeekId(sport);
                    form.setValue("startWeekId", startId);
                    setStartWeekId(startId);

                    const endId = getDefaultSportEndWeekId(sport);
                    form.setValue("endWeekId", endId);
                    setEndWeekId(endId);
                  }}
                  defaultValue={field.value}
                  name="sportId"
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a sport" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sports.map((sport) => (
                      <SelectItem key={sport.id} value={sport.id}>
                        {sport.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="leagueVisibility"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-end">
                <FormLabel className="flex items-center gap-2">
                  League Visibility{" "}
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        className="h-min w-min"
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <ul className="flex list-disc flex-col gap-2 p-2">
                        <li>
                          Select &quot;Private&quot; to only allow invited users
                          to join your league.
                        </li>
                        <li>
                          Select &quot;Public&quot; to allow anyone with a Picks
                          Leagues account to join your league.
                        </li>
                      </ul>
                    </HoverCardContent>
                  </HoverCard>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  name="leagueVisibility"
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose League Visbility" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LEAGUE_VISIBILITY_VALUES.map((visibility) => (
                      <SelectItem key={visibility} value={visibility}>
                        {visibility}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pickType"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Pick Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  name="pickType"
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a pick type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PICK_TYPE_VALUES.map((pickType) => (
                      <SelectItem key={pickType} value={pickType}>
                        {pickType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="picksPerWeek"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Picks Per Week</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(value) => {
                      field.onChange(value.target.valueAsNumber);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startWeekId"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Start Week</FormLabel>
                <Select
                  onValueChange={(val) => {
                    if (val) {
                      field.onChange(val);
                      setStartWeekId(val);
                    }
                  }}
                  value={startWeekId}
                  name="startWeekId"
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select start week" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sportWeeks.map((week) => (
                      <SelectItem key={`startWeek-${week.id}`} value={week.id}>
                        {week.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endWeekId"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>End Week</FormLabel>
                <Select
                  onValueChange={(val) => {
                    if (val) {
                      field.onChange(val);
                      setEndWeekId(val);
                    }
                  }}
                  value={endWeekId}
                  name="endWeekId"
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select end week" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sportWeeks.map((week) => (
                      <SelectItem key={`endWeek-${week.id}`} value={week.id}>
                        {week.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="size"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Size</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(value) => {
                    field.onChange(value.target.valueAsNumber);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        <Button className="w-full" disabled={pending} type="submit">
          Create League
        </Button>

        {errorMessage ? (
          <p className="text-sm font-medium text-destructive">{errorMessage}</p>
        ) : (
          <></>
        )}
      </CardFooter>
    </>
  );
}

export function CreateLeagueForm({
  sports,
}: {
  sports: DBSportWithActiveSeasonDetail[];
}) {
  const router = useRouter();

  const defaultStartWeekId = sports.length
    ? getDefaultSportStartWeekId(sports[0])
    : "";
  const defaultEndWeekId = sports.length
    ? getDefaultSportEndWeekId(sports[0])
    : "";

  const [formState, formAction] = useFormState(createLeagueAction, {});
  const form = useForm<FormSchema>({
    resolver: zodResolver(CreateLeagueSchema),
    defaultValues: {
      name: "",
      logoUrl: "",
      sportId: sports.length ? sports[0].id : "",
      leagueVisibility: LeagueVisibilities.LEAGUE_VISIBILITY_PRIVATE,
      pickType: PickTypes.PICK_TYPE_AGAINST_THE_SPREAD,
      picksPerWeek: DEFAULT_PICKS_PER_WEEK,
      startWeekId: defaultStartWeekId,
      endWeekId: defaultEndWeekId,
      size: DEFAULT_LEAGUE_SIZE,
    },
  });
  const formRef = useRef<HTMLFormElement>(null);

  const { toast } = useToast();

  return (
    <Form {...form}>
      <form
        ref={formRef}
        action={formAction}
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(async () => {
            const actionResponse = await createLeagueAction(
              formState,
              new FormData(formRef.current!),
            );

            if (actionResponse?.errors) {
              if (actionResponse?.errors?.name) {
                form.setError("name", {
                  type: "custom",
                  message: actionResponse.errors.name,
                });
              }

              if (actionResponse?.errors?.logoUrl) {
                form.setError("logoUrl", {
                  type: "custom",
                  message: actionResponse.errors.logoUrl,
                });
              }

              if (actionResponse?.errors?.sportId) {
                form.setError("sportId", {
                  type: "custom",
                  message: actionResponse.errors.sportId,
                });
              }

              if (actionResponse?.errors?.leagueVisibility) {
                form.setError("leagueVisibility", {
                  type: "custom",
                  message: actionResponse.errors.leagueVisibility,
                });
              }

              if (actionResponse?.errors?.pickType) {
                form.setError("pickType", {
                  type: "custom",
                  message: actionResponse.errors.pickType,
                });
              }

              if (actionResponse?.errors?.picksPerWeek) {
                form.setError("picksPerWeek", {
                  type: "custom",
                  message: actionResponse.errors.picksPerWeek,
                });
              }

              if (actionResponse?.errors?.startWeekId) {
                form.setError("startWeekId", {
                  type: "custom",
                  message: actionResponse.errors.startWeekId,
                });
              }

              if (actionResponse?.errors?.endWeekId) {
                form.setError("endWeekId", {
                  type: "custom",
                  message: actionResponse.errors.endWeekId,
                });
              }

              if (actionResponse?.errors?.size) {
                form.setError("size", {
                  type: "custom",
                  message: actionResponse.errors.size,
                });
              }

              return;
            }

            toast({
              title: "League Created!",
              description: "Your league has been successfully created.",
            });

            router.push("/dashboard");
            router.refresh();
          })(e);
        }}
      >
        <FormContent
          form={form}
          sports={sports}
          defaultSportWeeks={sports.length > 0 ? sports[0].season.weeks : []}
          defaultStartWeekId={defaultStartWeekId}
          defaultEndWeekId={defaultEndWeekId}
          errorMessage={formState.errors?.form ?? ""}
        />
      </form>
    </Form>
  );
}

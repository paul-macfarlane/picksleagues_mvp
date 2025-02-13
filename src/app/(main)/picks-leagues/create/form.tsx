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
import { DBSportLeagueWithSeasonsDetail } from "@/db/sportLeagues";
import { useFormStatus } from "react-dom";
import {
  CreatePicksLeagueSchema,
  PICKS_LEAGUE_DEFAULT_SIZE,
  PICKS_LEAGUE_DEFAULT_PICKS_PICKS_PER_WEEK,
  getPicksLeagueHomeUrl,
  PICKS_LEAGUE_VISIBILITY_VALUES,
  PicksLeagueVisibilities,
  PICKS_LEAGUE_PICK_TYPE_VALUES,
  PicksLeaguePickTypes,
} from "@/models/picksLeagues";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPicksLeagueAction } from "./action";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRef, useState, useActionState } from "react";
import { isUrl } from "@/shared/utils";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

type FormSchema = z.infer<typeof CreatePicksLeagueSchema>;

function getDefaultSportStartWeekId(
  sportLeague: DBSportLeagueWithSeasonsDetail,
): string {
  return sportLeague.seasons[0].weeks.length
    ? sportLeague.seasons[0].weeks[0].id
    : "";
}

function getDefaultSportEndWeekId(
  sportLeague: DBSportLeagueWithSeasonsDetail,
): string {
  return sportLeague.seasons[0].weeks.length
    ? sportLeague.seasons[0].weeks[sportLeague.seasons[0].weeks.length - 1].id
    : "";
}

export function CreatePicksLeagueForm({
  sportLeagues,
}: {
  sportLeagues: DBSportLeagueWithSeasonsDetail[];
}) {
  const router = useRouter();

  const defaultSportLeagueSeasonId =
    sportLeagues.length && sportLeagues[0].seasons.length
      ? sportLeagues[0].seasons[0].id
      : "";
  const defaultStartSportLeagueWeekId = sportLeagues.length
    ? getDefaultSportStartWeekId(sportLeagues[0])
    : "";
  const defaultEndSportLeagueWeekId = sportLeagues.length
    ? getDefaultSportEndWeekId(sportLeagues[0])
    : "";

  const [formState, formAction] = useActionState(createPicksLeagueAction, {});
  const form = useForm<FormSchema>({
    resolver: zodResolver(CreatePicksLeagueSchema),
    defaultValues: {
      name: "",
      logoUrl: "",
      sportLeagueId: sportLeagues.length ? sportLeagues[0].id : "",
      sportLeagueSeasonId: defaultSportLeagueSeasonId,
      visibility: PicksLeagueVisibilities.PRIVATE,
      pickType: PicksLeaguePickTypes.AGAINST_THE_SPREAD,
      picksPerWeek: PICKS_LEAGUE_DEFAULT_PICKS_PICKS_PER_WEEK,
      startSportLeagueWeekId: defaultStartSportLeagueWeekId,
      endSportLeagueWeekId: defaultEndSportLeagueWeekId,
      size: PICKS_LEAGUE_DEFAULT_SIZE,
    },
  });
  const formRef = useRef<HTMLFormElement>(null);
  const { pending } = useFormStatus();

  const leagueName = form.watch("name");
  const logoUrl = form.watch("logoUrl");

  const defaultSportLeagueWeeks =
    sportLeagues.length > 0 ? sportLeagues[0].seasons[0].weeks : [];
  const [sportLeagueWeeks, setSportLeagueWeeks] = useState(
    defaultSportLeagueWeeks,
  );
  const [startSportLeagueWeekId, setStartSportLeagueWeekId] = useState(
    defaultStartSportLeagueWeekId,
  );
  const [endSportLeagueWeekId, setEndSportLeagueWeekId] = useState(
    defaultEndSportLeagueWeekId,
  );

  const selectedSportLeagueId = form.watch("sportLeagueId");
  const selectedSportLeagueDetails = sportLeagues.find(
    (league) => league.id === selectedSportLeagueId,
  )!;

  const { toast } = useToast();

  return (
    <Form {...form}>
      <form
        ref={formRef}
        action={formAction}
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(async () => {
            const actionResponse = await createPicksLeagueAction(
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

              if (actionResponse?.errors?.sportLeagueId) {
                form.setError("sportLeagueId", {
                  type: "custom",
                  message: actionResponse.errors.sportLeagueId,
                });
              }

              if (actionResponse?.errors?.visibility) {
                form.setError("visibility", {
                  type: "custom",
                  message: actionResponse.errors.visibility,
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

              if (actionResponse?.errors?.startSportLeagueWeekId) {
                form.setError("startSportLeagueWeekId", {
                  type: "custom",
                  message: actionResponse.errors.startSportLeagueWeekId,
                });
              }

              if (actionResponse?.errors?.endSportLeagueWeekId) {
                form.setError("endSportLeagueWeekId", {
                  type: "custom",
                  message: actionResponse.errors.endSportLeagueWeekId,
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

            router.push(getPicksLeagueHomeUrl(actionResponse.leagueId!));
          })(e);
        }}
      >
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
                      src={isUrl(logoUrl) ? logoUrl : undefined}
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
              name="sportLeagueId"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Sport League</FormLabel>
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val);

                      const sportLeague = sportLeagues.find(
                        (sportLeague) => sportLeague.id === val,
                      )!;

                      form.setValue("sportLeagueSeasonId", "");

                      setSportLeagueWeeks(sportLeague.seasons[0].weeks);

                      const startId = getDefaultSportStartWeekId(sportLeague);
                      form.setValue("startSportLeagueWeekId", startId);
                      setStartSportLeagueWeekId(startId);

                      const endId = getDefaultSportEndWeekId(sportLeague);
                      form.setValue("endSportLeagueWeekId", endId);
                      setEndSportLeagueWeekId(endId);
                    }}
                    defaultValue={field.value}
                    name="sportLeagueId"
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a sport league" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sportLeagues.map((sportLeague) => (
                        <SelectItem key={sportLeague.id} value={sportLeague.id}>
                          {sportLeague.abbreviation}
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
              name="sportLeagueSeasonId"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Season</FormLabel>
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val);
                      if (!val) {
                        return;
                      }

                      const sportLeague = sportLeagues.find(
                        (league) =>
                          !!league.seasons.find((season) => season.id === val),
                      )!;
                      const season = sportLeague.seasons.find(
                        (season) => season.id === val,
                      )!;
                      setSportLeagueWeeks(season.weeks);
                      setStartSportLeagueWeekId("");
                      setEndSportLeagueWeekId("");
                    }}
                    value={field.value}
                    name="sportLeagueSeasonId"
                    disabled={!selectedSportLeagueId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a season" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {selectedSportLeagueDetails?.seasons
                        .filter(
                          (season) => new Date(season.endTime) > new Date(),
                        )
                        .map((season) => (
                          <SelectItem key={season.id} value={season.id}>
                            {season.name}
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
              name="startSportLeagueWeekId"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Start Week</FormLabel>
                  <Select
                    onValueChange={(val) => {
                      if (val) {
                        field.onChange(val);
                        setStartSportLeagueWeekId(val);
                      }
                    }}
                    value={startSportLeagueWeekId}
                    name="startSportLeagueWeekId"
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select start week" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sportLeagueWeeks.map((week) => (
                        <SelectItem
                          key={`startWeek-${week.id}`}
                          value={week.id}
                        >
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
              name="endSportLeagueWeekId"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>End Week</FormLabel>
                  <Select
                    onValueChange={(val) => {
                      if (val) {
                        field.onChange(val);
                        setEndSportLeagueWeekId(val);
                      }
                    }}
                    value={endSportLeagueWeekId}
                    name="endSportLeagueWeekId"
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select end week" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sportLeagueWeeks.map((week) => (
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

            <FormField
              control={form.control}
              name="visibility"
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
                            Select &quot;Private&quot; to only allow invited
                            users to join your league.
                          </li>
                          <li>
                            Select &quot;Public&quot; to allow anyone with a
                            Picks Leagues account to join your league.
                          </li>
                        </ul>
                      </HoverCardContent>
                    </HoverCard>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    name="visibility"
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose League Visbility" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PICKS_LEAGUE_VISIBILITY_VALUES.map((visibility) => (
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
                      {PICKS_LEAGUE_PICK_TYPE_VALUES.map((pickType) => (
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
                        if (isNaN(value.target.valueAsNumber)) {
                          field.onChange("");
                        } else {
                          field.onChange(value.target.valueAsNumber);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                        if (isNaN(value.target.valueAsNumber)) {
                          field.onChange("");
                        } else {
                          field.onChange(value.target.valueAsNumber);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" disabled={pending} type="submit">
            Create League
          </Button>

          {formState.errors?.form ? (
            <p className="text-sm font-medium text-destructive">
              {formState.errors.form}
            </p>
          ) : (
            <></>
          )}
        </CardFooter>
      </form>
    </Form>
  );
}

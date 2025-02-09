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
import { DBSportLeagueWithSeasonDetail } from "@/db/sportLeagues";
import { useFormStatus } from "react-dom";
import {
  PICKS_LEAGUE_VISIBILITY_VALUES,
  PICKS_LEAGUE_PICK_TYPE_VALUES,
  UpdatePicksLeagueSchema,
} from "@/models/picksLeagues";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Info } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { DBPicksLeagueSettingDetails } from "@/db/picksLeagues";
import { updatePicksLeagueAction } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/settings/action";
import { useRouter } from "next/navigation";
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
import { Separator } from "@/components/ui/separator";
import axios, { AxiosError } from "axios";

type FormSchema = z.infer<typeof UpdatePicksLeagueSchema>;

export function PicksLeagueSettingsForm({
  sportLeague,
  picksLeague,
  canEditSeasonSettings,
}: {
  sportLeague: DBSportLeagueWithSeasonDetail;
  picksLeague: DBPicksLeagueSettingDetails;
  canEditSeasonSettings: boolean;
}) {
  const defaultStartSportLeagueWeekId = picksLeague.startSportLeagueWeek.id;
  const defaultEndSportLeagueWeekId = picksLeague.endSportLeagueWeek.id;

  const [formState, formAction] = useActionState(updatePicksLeagueAction, {});
  const form = useForm<FormSchema>({
    resolver: zodResolver(UpdatePicksLeagueSchema),
    defaultValues: {
      id: picksLeague.id,
      name: picksLeague.name,
      logoUrl: picksLeague.logoUrl ?? "", // needed because controlled inputs can't have null/undefined values
      sportLeagueId: picksLeague.sportLeagueId,
      visibility: picksLeague.visibility,
      pickType: picksLeague.pickType,
      picksPerWeek: picksLeague.picksPerWeek,
      startSportLeagueWeekId: defaultStartSportLeagueWeekId,
      endSportLeagueWeekId: defaultEndSportLeagueWeekId,
      size: picksLeague.size,
    },
  });
  const formRef = useRef<HTMLFormElement>(null);
  const { pending } = useFormStatus();

  const leagueName = form.watch("name");
  const logoUrl = form.watch("logoUrl");

  let sportLeagueWeeks = [];
  if (canEditSeasonSettings) {
    sportLeagueWeeks = sportLeague.season.weeks;
  } else {
    sportLeagueWeeks = [
      picksLeague.startSportLeagueWeek,
      picksLeague.endSportLeagueWeek,
    ];
  }

  const [startSportLeagueWeekId, setStartSportLeagueWeekId] = useState(
    defaultStartSportLeagueWeekId,
  );
  const [endSportLeagueWeekId, setEndSportLeagueWeekId] = useState(
    defaultEndSportLeagueWeekId,
  );

  const { toast } = useToast();

  const router = useRouter();

  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const onDeleteLeague = async () => {
    try {
      setDeleteSubmitting(true);

      await axios.delete(
        `${process.env.NEXT_PUBLIC_HOST!}/api/picks-leagues/${picksLeague.id}`,
      );

      toast({
        title: "League Deleted!",
        description: "Picks League Deleted Successfully.",
      });
      router.push("/dashboard");
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

      setDeleteSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        ref={formRef}
        action={formAction}
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(formRef.current!);
          formData.set("sportLeagueId", picksLeague.sportLeagueId); // always disabled so always need to set
          if (!canEditSeasonSettings) {
            formData.set("startSportLeagueWeekId", startSportLeagueWeekId);
            formData.set("endSportLeagueWeekId", endSportLeagueWeekId);
            formData.set("size", `${picksLeague.size}`);
            formData.set("picksPerWeek", `${picksLeague.picksPerWeek}`);
            formData.set("pickType", picksLeague.pickType);
            formData.set("visibility", picksLeague.visibility);
          }
          form.handleSubmit(async () => {
            const actionResponse = await updatePicksLeagueAction(
              formState,
              formData,
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
              title: "League Updated!",
              description: "Your league has been successfully updated.",
            });

            router.refresh();
          })(e);
        }}
      >
        <CardContent className="space-y-6">
          <input
            {...form.register("id")}
            name="id"
            type="hidden"
            value={picksLeague.id}
          />

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
                    defaultValue={field.value}
                    name="sportLeagueId"
                    disabled
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a sport league" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem key={sportLeague.id} value={sportLeague.id}>
                        {sportLeague.abbreviation}
                      </SelectItem>
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
                    disabled={!canEditSeasonSettings}
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
                    disabled={!canEditSeasonSettings}
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
                      {...field}
                      type="number"
                      disabled={!canEditSeasonSettings}
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
              name="startSportLeagueWeekId"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Start Week</FormLabel>
                  <Select
                    disabled={!canEditSeasonSettings}
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
                    disabled={!canEditSeasonSettings}
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
          </div>

          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Size</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={!canEditSeasonSettings}
                    type="number"
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
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" disabled={pending} type="submit">
            Save
          </Button>

          {formState.errors?.form ? (
            <p className="text-sm font-medium text-destructive">
              {formState.errors.form}
            </p>
          ) : (
            <></>
          )}

          <Separator />

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant={"destructive"} className="w-full">
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you sure you want to delete this league?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  league and all of its history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleteSubmitting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDeleteLeague}
                  disabled={deleteSubmitting}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </form>
    </Form>
  );
}

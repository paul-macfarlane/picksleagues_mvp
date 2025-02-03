"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { DBSportLeagueWithSeasonDetail } from "@/db/sportLeagues";
import { PICKS_LEAGUE_PICK_TYPE_VALUES } from "@/models/picksLeagues";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { DBSportLeagueWeek } from "@/db/sportLeagueWeeks";

interface FilterFormData {
  sportLeagueId: string;
  pickType: string;
  picksPerWeek?: number;
  startSportLeagueWeekId: string;
  endSportLeagueWeekId: string;
  size?: number;
}

export default function FilterLeaguesForm({
  sportLeagues,
}: {
  sportLeagues: DBSportLeagueWithSeasonDetail[];
}) {
  const router = useRouter();

  const form = useForm<FilterFormData>();

  const onSubmit = (data: FilterFormData) => {
    const activeParams = Object.fromEntries(
      Object.entries(data)
        .filter(([_, value]) => Boolean(value))
        .map(([key, value]) => [key, String(value)]),
    );
    const queryParams = new URLSearchParams(activeParams).toString();
    const url = `/picks-leagues/join?${queryParams}`;

    router.push(url);
  };

  // need to track this state outside react hook form so that values can be set and reset
  const [picksPerWeek, setPicksPerWeek] = useState<number | undefined>();
  const [size, setSize] = useState<number | undefined>();
  const [sportLeagueWeeks, setSportLeagueWeeks] = useState<DBSportLeagueWeek[]>(
    [],
  );
  const [startSportLeagueWeekId, setStartSportLeagueWeekId] = useState<
    string | undefined
  >();
  const [endSportLeagueWeekId, setEndSportLeagueWeekId] = useState<
    string | undefined
  >();

  const selectedSportLeagueId = form.watch("sportLeagueId");
  const selectedSportLeagueDetails = sportLeagues.find(
    (league) => league.id === selectedSportLeagueId,
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                      setSportLeagueWeeks(sportLeague.season.weeks);
                      setStartSportLeagueWeekId("");
                      setEndSportLeagueWeekId("");
                    }}
                    value={field.value}
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
              name="pickType"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Pick Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    name="pickType"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pick type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PICKS_LEAGUE_PICK_TYPE_VALUES.map((pickType) => (
                        <SelectItem key={pickType} value={pickType}>
                          {pickType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="startSportLeagueWeekId"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>
                    Start Week{" "}
                    {selectedSportLeagueDetails
                      ? `(${selectedSportLeagueDetails.season.name} season)`
                      : ""}
                  </FormLabel>
                  <Select
                    onValueChange={(val) => {
                      if (val) {
                        field.onChange(val);
                        setStartSportLeagueWeekId(val);
                      }
                    }}
                    value={startSportLeagueWeekId}
                    name="startSportLeagueWeekId"
                    disabled={sportLeagueWeeks.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={"Select week"} />
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
                  <FormLabel>
                    End Week{" "}
                    {selectedSportLeagueDetails
                      ? `(${selectedSportLeagueDetails.season.name} season)`
                      : ""}
                  </FormLabel>
                  <Select
                    onValueChange={(val) => {
                      if (val) {
                        field.onChange(val);
                        setEndSportLeagueWeekId(val);
                      }
                    }}
                    value={endSportLeagueWeekId}
                    name="endSportLeagueWeekId"
                    disabled={sportLeagueWeeks.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select end week" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sportLeagueWeeks.map((sportLeagueWeek) => (
                        <SelectItem
                          key={`endWeek-${sportLeagueWeek.id}`}
                          value={sportLeagueWeek.id}
                        >
                          {sportLeagueWeek.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                      value={picksPerWeek ?? ""}
                      onChange={(value) => {
                        if (isNaN(value.target.valueAsNumber)) {
                          field.onChange("");
                          setPicksPerWeek(undefined);
                        } else {
                          field.onChange(value.target.valueAsNumber);
                          setPicksPerWeek(value.target.valueAsNumber);
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
                      {...field}
                      type="number"
                      value={size ?? ""}
                      onChange={(value) => {
                        if (isNaN(value.target.valueAsNumber)) {
                          field.onChange("");
                          setSize(undefined);
                        } else {
                          field.onChange(value.target.valueAsNumber);
                          setSize(value.target.valueAsNumber);
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
          <Button type="submit" className="w-full">
            Apply Filters
          </Button>

          <Button
            onClick={() => {
              // annoying, but in order to clear form values all the following below was needed
              form.setValue("sportLeagueId", "");
              form.setValue("pickType", "");

              setStartSportLeagueWeekId("");
              form.setValue("startSportLeagueWeekId", "");
              setEndSportLeagueWeekId("");
              form.setValue("endSportLeagueWeekId", "");

              setSportLeagueWeeks([]);

              form.setValue("picksPerWeek", undefined);
              setPicksPerWeek(undefined);

              form.setValue("size", undefined);
              setSize(undefined);

              router.push("/picks-leagues/join");
            }}
            variant="secondary"
            type="button"
            className="w-full"
          >
            Clear Filters
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}

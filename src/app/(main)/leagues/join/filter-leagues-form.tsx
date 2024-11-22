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
import { DBSportWeek, DBSportWithActiveSeasonDetail } from "@/db/sports";
import { PICK_TYPE_VALUES } from "@/models/leagues";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";

interface FilterFormData {
  sportId: string;
  pickType: string;
  picksPerWeek?: number;
  startWeekId: string;
  endWeekId: string;
  size?: number;
}

export default function FilterLeaguesForm({
  sports,
}: {
  sports: DBSportWithActiveSeasonDetail[];
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
    const url = `/leagues/join?${queryParams}`;

    router.push(url);
  };

  // need to track this state outside of react hook form so that values can be set and reset
  const [picksPerWeek, setPicksPerWeek] = useState<number | undefined>();
  const [size, setSize] = useState<number | undefined>();
  const [sportWeeks, setSportWeeks] = useState<DBSportWeek[]>([]);
  const [startWeekId, setStartWeekId] = useState<string | undefined>();
  const [endWeekId, setEndWeekId] = useState<string | undefined>();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                      setStartWeekId("");
                      setEndWeekId("");
                    }}
                    value={field.value}
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
                      {PICK_TYPE_VALUES.map((pickType) => (
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
                    disabled={sportWeeks.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={"Select week"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sportWeeks.map((week) => (
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
                    disabled={sportWeeks.length === 0}
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
                        field.onChange(value.target.valueAsNumber);
                        setPicksPerWeek(value.target.valueAsNumber);
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
                        field.onChange(value.target.valueAsNumber);
                        setSize(value.target.valueAsNumber);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-8">
          <Button type="submit" className="w-full">
            Apply Filters
          </Button>

          <Button
            onClick={() => {
              // annoying, but in order to clear form values all of the following below was needed
              form.setValue("sportId", "");
              form.setValue("pickType", "");

              setStartWeekId("");
              form.setValue("startWeekId", "");
              setEndWeekId("");
              form.setValue("endWeekId", "");

              setSportWeeks([]);

              form.setValue("picksPerWeek", undefined);
              setPicksPerWeek(undefined);

              form.setValue("size", undefined);
              setSize(undefined);

              router.push("/leagues/join");
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

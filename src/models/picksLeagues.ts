import { z } from "zod";
import { IMG_URL_MAX_LENGTH } from "./db";

export const PICKS_LEAGUE_MIN_NAME_LENGTH = 3;
export const PICKS_LEAGUE_MAX_NAME_LENGTH = 32;
const PICKS_LEAGUE_MIN_NAME_LENGTH_ERROR = `Must at least ${PICKS_LEAGUE_MIN_NAME_LENGTH} characters`;
const PICKS_LEAGUE_MAX_NAME_LENGTH_ERROR = `Cannot be more than ${PICKS_LEAGUE_MAX_NAME_LENGTH} characters`;

export const PICKS_LEAGUE_MIN_PICKS_PER_WEEK = 1;
export const PICKS_LEAGUE_MAX_PICKS_PER_WEEK = 16;
export const PICKS_LEAGUE_DEFAULT_PICKS_PICKS_PER_WEEK = 5;

const PICKS_LEAGUE_PICKS_PER_WEEK_NUMBER_ERROR = `Must be a number greater than or equal to ${PICKS_LEAGUE_MIN_PICKS_PER_WEEK} and must be a number less than or equal to ${PICKS_LEAGUE_MAX_PICKS_PER_WEEK}`;
const PICKS_LEAGUE_MIN_PICKS_PER_WEEK_ERROR = `Must be a number greater than or equal to ${PICKS_LEAGUE_MIN_PICKS_PER_WEEK}`;
const PICKS_LEAGUE_MAX_PICKS_PER_WEEK_ERROR = `Must be a number less than or equal to ${PICKS_LEAGUE_MAX_PICKS_PER_WEEK}`;

export const PICKS_LEAGUE_MIN_SIZE = 6;
export const PICKS_LEAGUE_MAX_SIZE = 20;
export const PICKS_LEAGUE_DEFAULT_SIZE = 10;

const PICKS_LEAGUE_SIZE_NUMBER_ERROR = `Must be a number greater than or equal to ${PICKS_LEAGUE_MIN_SIZE} and must be a number less than or equal to ${PICKS_LEAGUE_MAX_SIZE}`;
const PICKS_LEAGUE_MIN_SIZE_ERROR = `Must be a number greater than or equal to ${PICKS_LEAGUE_MIN_SIZE}`;
const PICKS_LEAGUE_MAX_SIZE_ERROR = `Must be a number less than or equal to ${PICKS_LEAGUE_MAX_SIZE}`;

export enum PicksLeaguePickTypes {
  AGAINST_THE_SPREAD = "Against the Spread",
  STRAIGHT_UP = "Straight Up",
  OVER_UNDER = "Over/Under",
}

export const PICKS_LEAGUE_PICK_TYPE_VALUES =
  Object.values(PicksLeaguePickTypes);

export enum PicksLeagueVisibilities {
  PRIVATE = "Private",
  PUBLIC = "Public",
}

export const PICKS_LEAGUE_VISIBILITY_VALUES = Object.values(
  PicksLeagueVisibilities,
);

const picksLeagueNameSchema = z
  .string()
  .trim()
  .min(PICKS_LEAGUE_MIN_NAME_LENGTH, PICKS_LEAGUE_MIN_NAME_LENGTH_ERROR)
  .max(PICKS_LEAGUE_MAX_NAME_LENGTH, PICKS_LEAGUE_MAX_NAME_LENGTH_ERROR);

const picksLeagueLogoUrlSchema = z.union([
  z.string().url("Must be a valid url.").max(IMG_URL_MAX_LENGTH),
  z.string().length(0), // annoying, but because you can't have a controlled input with the value undefined in react-hook-form, we have to allow this to be an empty string
]);

const picksLeagueVisibilitySchema = z.enum(
  [PicksLeagueVisibilities.PRIVATE, PicksLeagueVisibilities.PUBLIC],
  {
    message: `Invalid League Visibility. Must be one of ${PICKS_LEAGUE_VISIBILITY_VALUES.join(", ")}.`,
  },
);

const picksLeaguePickTypeSchema = z.enum(
  [
    PicksLeaguePickTypes.AGAINST_THE_SPREAD,
    PicksLeaguePickTypes.STRAIGHT_UP,
    PicksLeaguePickTypes.OVER_UNDER,
  ],
  {
    message: `Invalid Pick Type. Must be one of ${PICKS_LEAGUE_PICK_TYPE_VALUES.join(", ")}.`,
  },
);

const picksLeaguePicksPerWeekSchema = z.union([
  z
    .number({
      message: PICKS_LEAGUE_PICKS_PER_WEEK_NUMBER_ERROR,
    })
    .int("Must be a whole number")
    .min(PICKS_LEAGUE_MIN_PICKS_PER_WEEK, PICKS_LEAGUE_MIN_PICKS_PER_WEEK_ERROR)
    .max(
      PICKS_LEAGUE_MAX_PICKS_PER_WEEK,
      PICKS_LEAGUE_MAX_PICKS_PER_WEEK_ERROR,
    ),
  z.coerce
    .number({
      message: PICKS_LEAGUE_PICKS_PER_WEEK_NUMBER_ERROR,
    })
    .int("Must be a whole number")
    .min(PICKS_LEAGUE_MIN_PICKS_PER_WEEK, PICKS_LEAGUE_MIN_PICKS_PER_WEEK_ERROR)
    .max(
      PICKS_LEAGUE_MAX_PICKS_PER_WEEK,
      PICKS_LEAGUE_MAX_PICKS_PER_WEEK_ERROR,
    ),
]);

const picksLeagueSizeSchema = z.union([
  z
    .number({
      message: PICKS_LEAGUE_SIZE_NUMBER_ERROR,
    })
    .int("Must be a whole number")
    .min(PICKS_LEAGUE_MIN_SIZE, PICKS_LEAGUE_MIN_SIZE_ERROR)
    .max(PICKS_LEAGUE_MAX_SIZE, PICKS_LEAGUE_MAX_SIZE_ERROR),
  z.coerce
    .number({
      message: PICKS_LEAGUE_SIZE_NUMBER_ERROR,
    })
    .int("Must be a whole number")
    .min(PICKS_LEAGUE_MIN_SIZE, PICKS_LEAGUE_MIN_SIZE_ERROR)
    .max(PICKS_LEAGUE_MAX_SIZE, PICKS_LEAGUE_MAX_SIZE_ERROR),
]);

export const CreatePicksLeagueSchema = z.object({
  name: picksLeagueNameSchema,
  logoUrl: picksLeagueLogoUrlSchema,
  sportLeagueId: z.string().trim().uuid(),
  visibility: picksLeagueVisibilitySchema,
  pickType: picksLeaguePickTypeSchema,
  picksPerWeek: picksLeaguePicksPerWeekSchema,
  startSportLeagueWeekId: z.string().trim().uuid(),
  endSportLeagueWeekId: z.string().trim().uuid(),
  size: picksLeagueSizeSchema,
});

export enum PicksLeagueTabIds {
  MEMBERS = "members",
  MY_PICKS = "my-picks",
  LEAGUE_PICKS = "league-picks",
  SETTINGS = "settings",
}

export interface PicksLeagueTab {
  id: PicksLeagueTabIds;
  name: string;
}

export const MEMBER_PICKS_LEAGUE_TABS: PicksLeagueTab[] = [
  {
    id: PicksLeagueTabIds.MEMBERS,
    name: "League Members",
  },
  {
    id: PicksLeagueTabIds.MY_PICKS,
    name: "My Picks",
  },
  {
    id: PicksLeagueTabIds.LEAGUE_PICKS,
    name: "League Picks",
  },
];

export const COMMISSIONER_PICKS_LEAGUE_TABS = [
  ...MEMBER_PICKS_LEAGUE_TABS,
  {
    id: PicksLeagueTabIds.SETTINGS,
    name: "Settings",
  },
];

export function getPicksLeagueHomeUrl(leagueId: string): string {
  return `/picks-leagues/${leagueId}/${PicksLeagueTabIds.MEMBERS}`;
}

export const PICKS_LEAGUE_PICK_TYPE_MAX_LENGTH = 32;
export const PICKS_LEAGUE_VISIBILITY_MAX_LENGTH = 32;

export const UpdatePicksLeagueSchema = z.object({
  id: z.string().trim().uuid(),
  name: picksLeagueNameSchema,
  logoUrl: picksLeagueLogoUrlSchema,
  sportLeagueId: z.string().trim().uuid(),
  visibility: picksLeagueVisibilitySchema,
  pickType: picksLeaguePickTypeSchema,
  picksPerWeek: picksLeaguePicksPerWeekSchema,
  startSportLeagueWeekId: z.string().trim().uuid(),
  endSportLeagueWeekId: z.string().trim().uuid(),
  size: picksLeagueSizeSchema,
});

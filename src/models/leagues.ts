import { z } from "zod";
import { IMG_URL_MAX_LENGTH } from "./db";

export const MIN_LEAGUE_NAME_LENGTH = 3;
export const MAX_LEAGUE_NAME_LENGTH = 32;
const MIN_LEAGUE_NAME_LENGTH_ERROR = `Must at least ${MIN_LEAGUE_NAME_LENGTH} characters`;
const MAX_LEAGUE_NAME_LENGTH_ERROR = `Cannot be more than ${MAX_LEAGUE_NAME_LENGTH} characters`;

export const MIN_PICKS_PER_WEEK = 1;
export const MAX_PICKS_PER_WEEK = 16;
export const DEFAULT_PICKS_PER_WEEK = 5;

const PICKS_PER_WEEK_NUMBER_ERROR = `Must be a number greater than or equal to ${MIN_PICKS_PER_WEEK} and must be a number less than or equal to ${MAX_PICKS_PER_WEEK}`;
const MIN_PICKS_PER_WEEK_ERROR = `Must be a number greater than or equal to ${MIN_PICKS_PER_WEEK}`;
const MAX_PICKS_PER_WEEK_ERROR = `Must be a number less than or equal to ${MAX_PICKS_PER_WEEK}`;

export const MIN_LEAGUE_SIZE = 6;
export const MAX_LEAGUE_SIZE = 20;
export const DEFAULT_LEAGUE_SIZE = 10;

const LEAGUE_SIZE_NUMBER_ERROR = `Must be a number greater than or equal to ${MIN_LEAGUE_SIZE} and must be a number less than or equal to ${MAX_LEAGUE_SIZE}`;
const MIN_LEAGUE_SIZE_ERROR = `Must be a number greater than or equal to ${MIN_LEAGUE_SIZE}`;
const MAX_LEAGUE_SIZE_ERROR = `Must be a number less than or equal to ${MAX_LEAGUE_SIZE}`;

export enum PickTypes {
  PICK_TYPE_AGAINST_THE_SPREAD = "Against the Spread",
  PICK_TYPE_STRAIGHT_UP = "Straight Up",
  PICK_TYPE_OVER_UNDER = "Over/Under",
}

export const PICK_TYPE_VALUES = Object.values(PickTypes);

export enum LeagueVisibilities {
  LEAGUE_VISIBILITY_PRIVATE = "Private",
  LEAGUE_VISIBILITY_PUBLIC = "Public",
}

export const LEAGUE_VISIBILITY_VALUES = Object.values(LeagueVisibilities);

export const CreateLeagueSchema = z.object({
  name: z
    .string()
    .trim()
    .min(MIN_LEAGUE_NAME_LENGTH, MIN_LEAGUE_NAME_LENGTH_ERROR)
    .max(MAX_LEAGUE_NAME_LENGTH, MAX_LEAGUE_NAME_LENGTH_ERROR),
  logoUrl: z.union([
    z.string().url("Must be a valud url.").max(IMG_URL_MAX_LENGTH),
    z.string().length(0), // annoying, but because you can't have a controlled input with the value undefined in react-hook-form, we have to allow this to be an empty string
  ]),
  sportLeagueId: z.string().trim().uuid(),
  leagueVisibility: z.enum(
    [
      LeagueVisibilities.LEAGUE_VISIBILITY_PRIVATE,
      LeagueVisibilities.LEAGUE_VISIBILITY_PUBLIC,
    ],
    {
      message: `Invalid League Visibility. Must be one of ${LEAGUE_VISIBILITY_VALUES.join(", ")}.`,
    },
  ),
  pickType: z.enum(
    [
      PickTypes.PICK_TYPE_AGAINST_THE_SPREAD,
      PickTypes.PICK_TYPE_STRAIGHT_UP,
      PickTypes.PICK_TYPE_OVER_UNDER,
    ],
    {
      message: `Invalid Pick Type. Must be one of ${PICK_TYPE_VALUES.join(", ")}.`,
    },
  ),
  picksPerWeek: z.union([
    z
      .number({
        message: PICKS_PER_WEEK_NUMBER_ERROR,
      })
      .int("Must be a whole number")
      .min(MIN_PICKS_PER_WEEK, MIN_PICKS_PER_WEEK_ERROR)
      .max(MAX_PICKS_PER_WEEK, MAX_PICKS_PER_WEEK_ERROR),
    z.coerce
      .number({
        message: PICKS_PER_WEEK_NUMBER_ERROR,
      })
      .int("Must be a whole number")
      .min(MIN_PICKS_PER_WEEK, MIN_PICKS_PER_WEEK_ERROR)
      .max(MAX_PICKS_PER_WEEK, MAX_PICKS_PER_WEEK_ERROR),
  ]),
  startWeekId: z.string().trim().uuid(),
  endWeekId: z.string().trim().uuid(),
  size: z.union([
    z
      .number({
        message: LEAGUE_SIZE_NUMBER_ERROR,
      })
      .int("Must be a whole number")
      .min(MIN_LEAGUE_SIZE, MIN_LEAGUE_SIZE_ERROR)
      .max(MAX_LEAGUE_SIZE, MAX_LEAGUE_SIZE_ERROR),
    z.coerce
      .number({
        message: LEAGUE_SIZE_NUMBER_ERROR,
      })
      .int("Must be a whole number")
      .min(MIN_LEAGUE_SIZE, MIN_LEAGUE_SIZE_ERROR)
      .max(MAX_LEAGUE_SIZE, MAX_LEAGUE_SIZE_ERROR),
  ]),
});

export enum LeagueMemberRoles {
  COMMISSIONER = "Commissioner",
  MEMBER = "Member",
  NONE = "NONE",
}

export const LEAGUE_MEMBER_ROLE_VALUES = Object.values(LeagueMemberRoles);

export const JoinLeagueSchema = z.object({
  leagueId: z.string().trim().uuid(),
});

export enum LeagueTabIds {
  MEMBERS = "members",
  MY_PICKS = "my-picks",
  LEAGUE_PICKS = "league-picks",
  SETTINGS = "settings",
}

export interface LeagueTab {
  id: LeagueTabIds;
  name: string;
}

export const MEMBER_LEAGUE_TABS: LeagueTab[] = [
  {
    id: LeagueTabIds.MEMBERS,
    name: "League Members",
  },
  {
    id: LeagueTabIds.MY_PICKS,
    name: "My Picks",
  },
  {
    id: LeagueTabIds.LEAGUE_PICKS,
    name: "League Picks",
  },
];

export const COMMISSIONER_LEAGUE_TABS = [
  ...MEMBER_LEAGUE_TABS,
  {
    id: LeagueTabIds.SETTINGS,
    name: "Settings",
  },
];

export function getLeagueHomeUrl(leagueId: string): string {
  return `/leagues/${leagueId}/${LeagueTabIds.MEMBERS}`;
}

export const LeagueInviteFormSchema = z.object({
  leagueId: z.string().uuid(),
});

export const LEAGUE_INVITE_EXPIRATION = 7 * 24 * 60 * 60 * 1000;
export const LEAGUE_ROLE_MAX_LENGTH = 32;
export const PICK_TYPE_MAX_LENGTH = 32;
export const LEAGUE_VISIBILITY_MAX_LENGTH = 32;

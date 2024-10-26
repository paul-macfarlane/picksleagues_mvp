import { z } from "zod";

export const MIN_PICKS_PER_WEEK = 1;
export const MAX_PICKS_PER_WEEK = 16;
export const DEFAULT_PICKS_PER_WEEK = 5;

const PICKS_PER_WEEK_NUMBER_ERROR = `Must be a number greater than or equal to ${MIN_PICKS_PER_WEEK} and must be a number less than or equal to ${MAX_PICKS_PER_WEEK}`;
const MIN_PICKS_PER_WEEK_ERROR = `Must be a number greater than or equal to ${MIN_PICKS_PER_WEEK}`;
const MAX_PICKS_PER_WEEK_ERROR = `Must be a number less than or equal to ${MAX_PICKS_PER_WEEK}`;

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
  name: z.string().trim().min(1, "Required."),
  logoUrl: z.union([
    z.string().url("Must be a valud url."),
    z.string().length(0), // annoying, but because you can't have a controlled input with the value undefined in react-hook-form, we have to allow this to be an empty string
  ]),
  sportId: z.string().trim().uuid(),
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
      .min(MIN_PICKS_PER_WEEK, MIN_PICKS_PER_WEEK_ERROR)
      .max(MAX_PICKS_PER_WEEK, MAX_PICKS_PER_WEEK_ERROR),
    z.coerce
      .number({
        message: PICKS_PER_WEEK_NUMBER_ERROR,
      })
      .min(MIN_PICKS_PER_WEEK, MIN_PICKS_PER_WEEK_ERROR)
      .max(MAX_PICKS_PER_WEEK, MAX_PICKS_PER_WEEK_ERROR),
  ]),
  startWeekId: z.string().trim().uuid(),
  endWeekId: z.string().trim().uuid(),
});

export enum LeagueMemberRoles {
  COMMISSIONER = "Commissioner",
  MEMBER = "Member",
}

export const LEAGUE_MEMBER_ROLE_VALUES = Object.values(LeagueMemberRoles);

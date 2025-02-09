import { z } from "zod";
import { PicksLeagueMemberRoles } from "./picksLeagueMembers";

export const JoinPicksLeagueSchema = z.object({
  leagueId: z.string().trim().uuid(),
});

export const PicksLeagueInviteFormSchema = z.object({
  leagueId: z.string().uuid(),
  role: z.enum([
    PicksLeagueMemberRoles.MEMBER,
    PicksLeagueMemberRoles.COMMISSIONER,
  ]),
});

export const DirectInviteFormSchema = z.object({
  leagueId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum([
    PicksLeagueMemberRoles.MEMBER,
    PicksLeagueMemberRoles.COMMISSIONER,
  ]),
});

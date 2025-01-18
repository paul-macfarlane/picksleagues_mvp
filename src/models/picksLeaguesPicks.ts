import { z } from "zod";

export const UpsertDBPicksLeaguePicksSchema = z.array(
  z.object({
    sportLeagueGameId: z.string().trim().uuid(),
    teamId: z.string().trim().uuid(),
  }),
);

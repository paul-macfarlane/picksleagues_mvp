"use server";

import { auth } from "@/auth";
import { createDBPicksLeague, DBPicksLeague } from "@/db/picksLeagues";
import {
  getDBSportLeagueById,
  getDBSportLeagueWeekById,
} from "@/db/sportLeagues";
import { getDBUserById } from "@/db/users";
import { withDBTransaction } from "@/db/transactions";
import { CreatePicksLeagueSchema } from "@/models/picksLeagues";
import { redirect } from "next/navigation";
import { createDBPicksLeagueSeason } from "@/db/picksLeagueSeasons";
import { createDBPicksLeagueMember } from "@/db/picksLeagueMembers";
import { PicksLeagueMemberRoles } from "@/models/picksLeagueMembers";
import { AUTH_URL } from "@/models/auth";
import { upsertDBPicksLeagueStandings } from "@/db/picksLeagueStandings";
import {
  getActiveDBSportLeagueSeasonHavingActiveWeeks,
  getNextDBSportLeagueSeason,
} from "@/db/sportLeagueSeason";

export interface CreatePicksLeagueFormState {
  errors?: {
    form?: string;
    name?: string;
    logoUrl?: string;
    sportLeagueId?: string;
    picksPerWeek?: string;
    pickType?: string;
    startSportLeagueWeekId?: string;
    endSportLeagueWeekId?: string;
    visibility?: string;
    size?: string;
  };
  leagueId?: string;
}

export async function createPicksLeagueAction(
  _prevState: CreatePicksLeagueFormState,
  formData: FormData,
): Promise<CreatePicksLeagueFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return redirect(AUTH_URL);
  }

  const dbUser = await getDBUserById(session.user.id);
  if (!dbUser) {
    console.error(
      `User with id ${session.user.id} from session not found in db while creating league`,
    );

    return {
      errors: {
        form: "An unexpected error occurred. Please try again later.",
      },
    };
  }

  const parsed = CreatePicksLeagueSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) {
    return {
      errors: {
        name: parsed.error.issues
          .filter((error) => error.path.join(".") === "name")
          .map((error) => error.message)
          .join(", "),
        logoUrl: parsed.error.issues
          .filter((error) => error.path.join(".") === "logoUrl")
          .map((error) => error.message)
          .join(", "),
        sportLeagueId: parsed.error.issues
          .filter((error) => error.path.join(".") === "sportLeagueId")
          .map((error) => error.message)
          .join(", "),
        visibility: parsed.error.issues
          .filter((error) => error.path.join(".") === "visibility")
          .map((error) => error.message)
          .join(", "),
        pickType: parsed.error.issues
          .filter((error) => error.path.join(".") === "pickType")
          .map((error) => error.message)
          .join(", "),
        picksPerWeek: parsed.error.issues
          .filter((error) => error.path.join(".") === "picksPerWeek")
          .map((error) => error.message)
          .join(", "),
        startSportLeagueWeekId: parsed.error.issues
          .filter((error) => error.path.join(".") === "startSportLeagueWeekId")
          .map((error) => error.message)
          .join(", "),
        endSportLeagueWeekId: parsed.error.issues
          .filter((error) => error.path.join(".") === "endSportLeagueWeekId")
          .map((error) => error.message)
          .join(", "),
        size: parsed.error.issues
          .filter((error) => error.path.join(".") === "size")
          .map((error) => error.message)
          .join(", "),
      },
    };
  }

  const dbSportLeague = await getDBSportLeagueById(parsed.data.sportLeagueId);
  if (!dbSportLeague) {
    return {
      errors: {
        sportLeagueId: "Invalid Sport League",
      },
    };
  }

  // first try to get the active season with 1 or more weeks, then if not available get the next season
  let dbSportLeagueSeason = await getActiveDBSportLeagueSeasonHavingActiveWeeks(
    dbSportLeague.id,
  );
  if (!dbSportLeagueSeason) {
    dbSportLeagueSeason = await getNextDBSportLeagueSeason(dbSportLeague.id);
  }
  if (!dbSportLeagueSeason) {
    console.error(
      `unable to find active or next sport league season for sport with id ${dbSportLeague.id}`,
    );
    return {
      errors: {
        form: "An unexpected error occurred, please try again later",
      },
    };
  }
  if (dbSportLeagueSeason.leagueId !== dbSportLeague.id) {
    return {
      errors: {
        form: "Sport League Season not in selected sport",
      },
    };
  }

  const startDBSportLeagueWeek = await getDBSportLeagueWeekById(
    parsed.data.startSportLeagueWeekId,
  );
  if (!startDBSportLeagueWeek) {
    return {
      errors: {
        startSportLeagueWeekId: "Invalid Start Week",
      },
    };
  }
  if (startDBSportLeagueWeek.seasonId !== dbSportLeagueSeason.id) {
    return {
      errors: {
        startSportLeagueWeekId:
          "Start Week not in selected Sport League Season",
      },
    };
  }

  const endDBSportLeagueWeek = await getDBSportLeagueWeekById(
    parsed.data.endSportLeagueWeekId,
  );
  if (!endDBSportLeagueWeek) {
    return {
      errors: {
        endSportLeagueWeekId: "Invalid End Week",
      },
    };
  }
  if (endDBSportLeagueWeek.seasonId !== dbSportLeagueSeason.id) {
    return {
      errors: {
        startSportLeagueWeekId: "End Week not in selected Sport League Season",
      },
    };
  }

  if (endDBSportLeagueWeek.startTime < startDBSportLeagueWeek.startTime) {
    return {
      errors: {
        startSportLeagueWeekId:
          "Start Week must be before or the same week as End Week",
      },
    };
  }

  let dbPicksLeague: DBPicksLeague | undefined = undefined;
  try {
    dbPicksLeague = await withDBTransaction(async (tx) => {
      const createDBPicksLeagueData = {
        name: parsed.data.name,
        logoUrl: parsed.data.logoUrl.length > 0 ? parsed.data.logoUrl : null,
        sportLeagueId: parsed.data.sportLeagueId,
        picksPerWeek: parsed.data.picksPerWeek,
        pickType: parsed.data.pickType,
        visibility: parsed.data.visibility,
        size: parsed.data.size,
      };
      const dbPicksLeague = await createDBPicksLeague(
        createDBPicksLeagueData,
        tx,
      );
      if (!dbPicksLeague) {
        console.error(
          "Unable to create league with data",
          createDBPicksLeagueData,
        );

        throw new Error("Unable to create league");
      }

      const createDBLeagueSeasonData = {
        leagueId: dbPicksLeague.id,
        sportLeagueSeasonId: dbSportLeagueSeason.id,
        startSportLeagueWeekId: startDBSportLeagueWeek.id,
        endSportLeagueWeekId: endDBSportLeagueWeek.id,
        active: true,
      };
      const dbPicksLeagueSeason = await createDBPicksLeagueSeason(
        createDBLeagueSeasonData,
        tx,
      );
      if (!dbPicksLeagueSeason) {
        console.error(
          "Unable to create league season with ",
          createDBLeagueSeasonData,
        );

        throw new Error("Unable to create league season");
      }

      const createDBPicksLeagueMemberData = {
        userId: dbUser.id,
        leagueId: dbPicksLeague.id,
        role: PicksLeagueMemberRoles.COMMISSIONER,
      };
      const dbPicksLeagueMember = await createDBPicksLeagueMember(
        createDBPicksLeagueMemberData,
        tx,
      );
      if (!dbPicksLeagueMember) {
        console.error(
          "Unable to create league member with ",
          createDBPicksLeagueMemberData,
        );

        throw new Error("Unable to create league member");
      }

      await upsertDBPicksLeagueStandings(
        [
          {
            userId: dbUser.id,
            seasonId: dbPicksLeagueSeason.id,
            wins: 0,
            losses: 0,
            pushes: 0,
            points: 0,
            rank: 1,
          },
        ],
        tx,
      );

      return dbPicksLeague;
    });
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error(e.message);
    }

    return {
      errors: {
        form: "Unable to create league at this time. Please try again later.",
      },
    };
  }

  return {
    leagueId: dbPicksLeague.id,
  };
}

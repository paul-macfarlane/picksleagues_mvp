"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  getDBPicksLeagueMember,
  getPicksLeagueMemberCount,
} from "@/db/picksLeagueMembers";
import { UpdatePicksLeagueSchema } from "@/models/picksLeagues";
import { PicksLeagueMemberRoles } from "@/models/picksLeagueMembers";
import {
  getPickLeagueSettingsDetails,
  updateDBPicksLeague,
} from "@/db/picksLeagues";
import { withDBTransaction } from "@/db/transactions";
import { getDBSportLeagueWeekById } from "@/db/sportLeagues";
import {
  getActiveDBPicksLeagueSeason,
  getNextDBPicksLeagueSeason,
  updateDBPicksLeagueSeason,
} from "@/db/picksLeagueSeasons";
import { canEditPicksLeagueSeasonSettings } from "@/shared/picksLeagues";
import { AUTH_URL } from "@/models/auth";

interface UpdatePicksLeagueActionState {
  errors?: {
    form?: string;
    id?: string;
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
}

export async function updatePicksLeagueAction(
  _prevState: UpdatePicksLeagueActionState,
  formData: FormData,
): Promise<UpdatePicksLeagueActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return redirect(AUTH_URL);
  }

  const parsed = UpdatePicksLeagueSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) {
    return {
      errors: {
        id: parsed.error.issues
          .filter((error) => error.path.join(".") === "id")
          .map((error) => error.message)
          .join(", "),
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

  const dbPicksLeagueMember = await getDBPicksLeagueMember(
    parsed.data.id,
    session.user.id,
  );
  if (!dbPicksLeagueMember) {
    return {
      errors: {
        form: "You are not a member of this league.",
      },
    };
  }

  if (dbPicksLeagueMember.role !== PicksLeagueMemberRoles.COMMISSIONER) {
    return {
      errors: {
        form: "You are not the commissioner of this league.",
      },
    };
  }

  const memberCount = await getPicksLeagueMemberCount(parsed.data.id);
  if (parsed.data.size < memberCount) {
    return {
      errors: {
        size: `Cannot set league size less than current amount of members (${memberCount})`,
      },
    };
  }

  let dbPicksLeagueSeason = await getActiveDBPicksLeagueSeason(parsed.data.id);
  if (!dbPicksLeagueSeason) {
    dbPicksLeagueSeason = await getNextDBPicksLeagueSeason(parsed.data.id);
  }
  if (!dbPicksLeagueSeason) {
    return {
      errors: {
        form: "Season not found.",
      },
    };
  }

  const dbPicksLeagueDetails = await getPickLeagueSettingsDetails(
    parsed.data.id,
    dbPicksLeagueSeason.id,
  );
  if (!dbPicksLeagueDetails) {
    return {
      errors: {
        form: "League not found.",
      },
    };
  }

  const canEditSeasonSettings =
    canEditPicksLeagueSeasonSettings(dbPicksLeagueDetails);
  if (canEditSeasonSettings) {
    try {
      await withDBTransaction(async (tx) => {
        const startDBSportLeagueWeek = await getDBSportLeagueWeekById(
          parsed.data.startSportLeagueWeekId,
          tx,
        );
        if (!startDBSportLeagueWeek) {
          console.error(
            `Sport week with id ${parsed.data.startSportLeagueWeekId} not found.`,
          );

          throw new Error("Invalid Start Week");
        }

        const endDBSportLeagueWeek = await getDBSportLeagueWeekById(
          parsed.data.endSportLeagueWeekId,
          tx,
        );
        if (!endDBSportLeagueWeek) {
          console.error(
            `Sports week with id ${parsed.data.endSportLeagueWeekId} not found.`,
          );
          throw new Error("Invalid End Week");
        }

        await updateDBPicksLeague(
          parsed.data.id,
          {
            name: parsed.data.name,
            logoUrl:
              parsed.data.logoUrl.length > 0 ? parsed.data.logoUrl : null,
            // sportLeagueId intentionally omitted because users are not allowed to change it
            picksPerWeek: parsed.data.picksPerWeek,
            pickType: parsed.data.pickType,
            visibility: parsed.data.visibility,
            size: parsed.data.size,
          },
          tx,
        );

        await updateDBPicksLeagueSeason(
          dbPicksLeagueSeason.id,
          {
            startSportLeagueWeekId: startDBSportLeagueWeek.id,
            endSportLeagueWeekId: endDBSportLeagueWeek.id,
          },
          tx,
        );
      });
    } catch (e) {
      let message = "An unexpected error occurred, please try again later.";
      if (e instanceof Error) {
        console.error(e);
        message = e.message;
      }

      return {
        errors: {
          form: message,
        },
      };
    }
  } else {
    await updateDBPicksLeague(parsed.data.id, {
      name: parsed.data.name,
      logoUrl: parsed.data.logoUrl.length > 0 ? parsed.data.logoUrl : null,
    });
  }

  return {};
}

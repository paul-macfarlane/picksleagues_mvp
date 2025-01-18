"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDBPicksLeagueMember } from "@/db/picksLeagueMembers";
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
  updateDBPicksLeagueSeason,
} from "@/db/picksLeagueSeasons";
import { canEditPicksLeagueSeasonSettings } from "@/shared/picksLeagues";

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
    return redirect("/auth");
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

  const dbPicksLeagueDetails = await getPickLeagueSettingsDetails(
    parsed.data.id,
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
    await withDBTransaction(async (tx) => {
      const startDBSportLeagueWeek = await getDBSportLeagueWeekById(
        parsed.data.startSportLeagueWeekId,
        tx,
      );
      if (!startDBSportLeagueWeek) {
        console.error(
          `Sport week with id ${parsed.data.startSportLeagueWeekId} not found.`,
        );
        return {
          errors: {
            startSportLeagueWeekId: "Invalid Start Week",
          },
        };
      }

      const endDBSportLeagueWeek = await getDBSportLeagueWeekById(
        parsed.data.endSportLeagueWeekId,
        tx,
      );
      if (!endDBSportLeagueWeek) {
        console.error(
          `Sports week with id ${parsed.data.endSportLeagueWeekId} not found.`,
        );
        return {
          errors: {
            endSportLeagueWeekId: "Invalid End Week",
          },
        };
      }

      const activeDBPicksLeagueSeason = await getActiveDBPicksLeagueSeason(
        parsed.data.id,
        tx,
      );
      if (!activeDBPicksLeagueSeason) {
        console.error(
          `Active season not found for league with id ${parsed.data.id}.`,
        );
        return {
          errors: {
            form: "Active season not found.",
          },
        };
      }

      await updateDBPicksLeague(
        parsed.data.id,
        {
          name: parsed.data.name,
          logoUrl: parsed.data.logoUrl,
          // sportLeagueId intentionally omitted because users are not allowed to change it
          picksPerWeek: parsed.data.picksPerWeek,
          pickType: parsed.data.pickType,
          visibility: parsed.data.visibility,
          size: parsed.data.size,
        },
        tx,
      );

      await updateDBPicksLeagueSeason(
        activeDBPicksLeagueSeason.id,
        {
          startSportLeagueWeekId: startDBSportLeagueWeek.id,
          endSportLeagueWeekId: endDBSportLeagueWeek.id,
        },
        tx,
      );
    });
  } else {
    await updateDBPicksLeague(parsed.data.id, {
      name: parsed.data.name,
      logoUrl: parsed.data.logoUrl ?? null,
    });
  }

  return {};
}

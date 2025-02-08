import { sportLeagueSeasons, sportLeagueWeeks } from "@/db/schema";
import { SportLeagueWeekTypes } from "@/models/sportLeagueWeeks";
import { DateTime } from "luxon";
import { sql } from "drizzle-orm";
import { DBTransaction } from "@/db/transactions";

interface SeasonConfig {
  name: string;
  startDate: DateTime;
  endDate: DateTime;
  weekCount: number;
}

interface CreateSeasonsConfig {
  leagueId: string;
  seasonConfigs: SeasonConfig[];
  tx: DBTransaction;
}

export async function seedSportSeasons({
  leagueId,
  seasonConfigs,
  tx,
}: CreateSeasonsConfig) {
  const seasons = [];

  for (const config of seasonConfigs) {
    const season = await tx
      .insert(sportLeagueSeasons)
      .values({
        leagueId,
        name: config.name,
        startTime: new Date(config.startDate.toMillis()),
        endTime: new Date(config.endDate.toMillis()),
      })
      .returning()
      .onConflictDoUpdate({
        target: [sportLeagueSeasons.leagueId, sportLeagueSeasons.name],
        set: {
          name: sql`excluded.name`,
          startTime: sql`excluded.start_time`,
          endTime: sql`excluded.end_time`,
        },
      })
      .get();

    const weekStartDate = config.startDate;
    const weeks = [];

    for (let i = 0; i < config.weekCount; i++) {
      const weekStart = weekStartDate.plus({ weeks: i });
      const weekEnd = weekStart.plus({ days: 6 }); // Each week is 7 days
      const pickLockTime = weekStart.set({ hour: 13 }); // Lock picks at 1 PM ET on game day

      const week = await tx
        .insert(sportLeagueWeeks)
        .values({
          seasonId: season.id,
          name: `Week ${i + 1}`,
          startTime: new Date(weekStart.toMillis()),
          endTime: new Date(weekEnd.toMillis()),
          pickLockTime: new Date(pickLockTime.toMillis()),
          espnEventsRef: `week${i + 1}`,
          type: SportLeagueWeekTypes.REGULAR_SEASON,
        })
        .returning()
        .onConflictDoUpdate({
          target: [sportLeagueWeeks.seasonId, sportLeagueWeeks.name],
          set: {
            name: sql`excluded.name`,
            startTime: sql`excluded.start_time`,
            endTime: sql`excluded.end_time`,
            pickLockTime: sql`excluded.pick_lock_time`,
            espnEventsRef: sql`excluded.espn_events_ref`,
            type: sql`excluded.type`,
            manual: sql`excluded.manual`,
          },
        })
        .get();

      weeks.push(week);
    }

    seasons.push({ season, weeks });
  }

  return seasons;
}

export function createSeasonConfigs(): SeasonConfig[] {
  const now = DateTime.now();
  const startOfToday = now.startOf("day");

  const prevSeasonStart = startOfToday.minus({ days: 120 });
  const prevSeasonEnd = prevSeasonStart.plus({ days: 120 });

  const currentSeasonStart = startOfToday.minus({ days: 30 });
  const currentSeasonEnd = currentSeasonStart.plus({ days: 120 });

  const futureSeasonStart = startOfToday.plus({ days: 30 });
  const futureSeasonEnd = futureSeasonStart.plus({ days: 120 });

  return [
    {
      name: "Previous Season",
      startDate: prevSeasonStart,
      endDate: prevSeasonEnd,
      weekCount: 8,
    },
    {
      name: "Current Season",
      startDate: currentSeasonStart,
      endDate: currentSeasonEnd,
      weekCount: 8,
    },
    {
      name: "Next Season",
      startDate: futureSeasonStart,
      endDate: futureSeasonEnd,
      weekCount: 8,
    },
  ];
}

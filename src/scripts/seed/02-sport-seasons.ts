import { sportLeagueSeasons, sportLeagueWeeks } from "@/db/schema";
import { SportLeagueWeekTypes } from "@/models/sportLeagueWeeks";
import { DateTime } from "luxon";
import { sql } from "drizzle-orm";
import { DBTransaction } from "@/db/transactions";

interface CreateSeasonsConfig {
  leagueId: string;
  seasonConfigs: {
    name: string;
    startDate: DateTime;
    endDate: DateTime;
    weekCount: number;
  }[];
  tx: DBTransaction;
}

export async function seedSportSeasons({
  leagueId,
  seasonConfigs,
  tx,
}: CreateSeasonsConfig) {
  const seasons = [];

  for (const config of seasonConfigs) {
    // Create season
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

    // Create weeks for the season
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
          espnEventsRef: `2024/week/${i + 1}`,
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

export function createSeasonConfigs() {
  const now = DateTime.now();
  const startOfToday = now.startOf("day");

  // Previous season (completed)
  const prevSeasonStart = startOfToday.minus({ days: 120 }); // 120 days ago
  const prevSeasonEnd = prevSeasonStart.plus({ days: 120 }); // 120 days duration

  // Current season (in progress)
  const currentSeasonStart = startOfToday.minus({ days: 30 }); // Started 30 days ago
  const currentSeasonEnd = currentSeasonStart.plus({ days: 120 }); // 120 days duration

  // Future season (not started)
  const futureSeasonStart = startOfToday.plus({ days: 30 }); // Starts in 30 days
  const futureSeasonEnd = futureSeasonStart.plus({ days: 120 }); // 120 days duration

  return [
    {
      name: "2023",
      startDate: prevSeasonStart,
      endDate: prevSeasonEnd,
      weekCount: 8,
    },
    {
      name: "2024",
      startDate: currentSeasonStart,
      endDate: currentSeasonEnd,
      weekCount: 8,
    },
    {
      name: "2025",
      startDate: futureSeasonStart,
      endDate: futureSeasonEnd,
      weekCount: 8,
    },
  ];
}

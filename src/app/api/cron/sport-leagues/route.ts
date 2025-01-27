import { NextRequest } from "next/server";
import { getESPNSportLeagues } from "@/integrations/espn/sportLeagues";
import { ESPNLeagueSlug, ESPNSportSlug } from "@/integrations/espn/shared";
import { upsertDBSportLeagues } from "@/db/sportLeagues";
import { getActiveESPNSportLeagueSeason } from "@/integrations/espn/sportLeagueSeasons";
import { getESPNSportLeagueTeams } from "@/integrations/espn/sportLeagueTeams";
import { upsertDBSportLeagueTeams } from "@/db/sportLeagueTeams";
import { upsertDBSportLeagueSeasons } from "@/db/sportLeagueSeason";
import {
  ESPNSeasonType,
  getESPNSportLeagueSeasonWeeks,
} from "@/integrations/espn/sportLeagueWeeks";
import { upsertDBSportLeagueWeeks } from "@/db/sportLeagueWeeks";
import { withDBTransaction } from "@/db/transactions";
import { SportLeagueWeekTypes } from "@/models/sportLeagueWeeks";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json(
      { message: "Unauthorized" },
      {
        status: 401,
      },
    );
  }

  try {
    await withDBTransaction(async (tx) => {
      const espnSportLeagues = await getESPNSportLeagues(
        ESPNSportSlug.FOOTBALL,
      );

      const espnSportLeagueIdToSlugMap = new Map<string, string>();
      for (const espnSportLeague of espnSportLeagues) {
        espnSportLeagueIdToSlugMap.set(
          espnSportLeague.id,
          espnSportLeague.slug,
        );
      }

      const dbSportLeagues = await upsertDBSportLeagues(
        espnSportLeagues.map((sportLeague) => ({
          name: sportLeague.name,
          abbreviation: sportLeague.abbreviation,
          logoUrl: sportLeague.logos.length
            ? sportLeague.logos[0].href
            : undefined,
          espnId: sportLeague.id,
        })),
        tx,
      );

      const espnSeasonNameToSportLeagueIdMap = new Map<string, string>();
      const espnLeagueIdToSeasonDisplayNameMap = new Map<string, string>();
      const sportLeagueIdToESPNSlugMap = new Map<string, string>();
      let espnSportLeagueSeasons = [];
      for (const dbSportLeague of dbSportLeagues) {
        const espnSportLeagueSlug = espnSportLeagueIdToSlugMap.get(
          dbSportLeague.espnId!,
        ) as ESPNLeagueSlug;
        const espnSportLeagueSeason = await getActiveESPNSportLeagueSeason(
          ESPNSportSlug.FOOTBALL,
          espnSportLeagueSlug,
        );

        if (espnSportLeagueSeason) {
          espnSportLeagueSeasons.push(espnSportLeagueSeason);
          espnSeasonNameToSportLeagueIdMap.set(
            espnSportLeagueSeason.displayName,
            dbSportLeague.id,
          );
          espnLeagueIdToSeasonDisplayNameMap.set(
            dbSportLeague.espnId!,
            espnSportLeagueSeason.displayName,
          );
          sportLeagueIdToESPNSlugMap.set(dbSportLeague.id, espnSportLeagueSlug);
        } else {
          throw new Error(
            `Unable to get active espn sport league season with slug "${espnSportLeagueSlug}"`,
          );
        }

        const espnSportLeagueTeams = await getESPNSportLeagueTeams([
          {
            sportSlug: ESPNSportSlug.FOOTBALL,
            leagueSlug: espnSportLeagueSlug,
            seasonDisplayName: espnLeagueIdToSeasonDisplayNameMap.get(
              dbSportLeague.espnId!,
            )!,
          },
        ]);

        await upsertDBSportLeagueTeams(
          espnSportLeagueTeams.map((espnSportTeam) => ({
            leagueId: dbSportLeague.id,
            name: espnSportTeam.displayName,
            espnId: espnSportTeam.id,
            location: espnSportTeam.location,
            abbreviation: espnSportTeam.abbreviation,
            logoUrl: espnSportTeam.logos.length
              ? espnSportTeam.logos[0].href
              : undefined,
          })),
          tx,
        );
      }

      const dbSportLeagueSeasons = await upsertDBSportLeagueSeasons(
        espnSportLeagueSeasons.map((sportSeason) => ({
          leagueId: espnSeasonNameToSportLeagueIdMap.get(
            sportSeason.displayName,
          )!,
          name: sportSeason.displayName,
          startTime: new Date(sportSeason.startDate),
          endTime: new Date(sportSeason.endDate),
          active: true,
        })),
        tx,
      );

      for (const dbSportLeagueSeason of dbSportLeagueSeasons) {
        const regularSeasonESPNWeeks = await getESPNSportLeagueSeasonWeeks(
          ESPNSportSlug.FOOTBALL,
          sportLeagueIdToESPNSlugMap.get(
            dbSportLeagueSeason.leagueId,
          )! as ESPNLeagueSlug,
          dbSportLeagueSeason.name,
          ESPNSeasonType.REGULAR_SEASON,
        );
        const postSeasonESPNWeeks = (
          await getESPNSportLeagueSeasonWeeks(
            ESPNSportSlug.FOOTBALL,
            sportLeagueIdToESPNSlugMap.get(
              dbSportLeagueSeason.leagueId,
            )! as ESPNLeagueSlug,
            dbSportLeagueSeason.name,
            ESPNSeasonType.POST_SEASON,
          )
        ).filter((week) => week.text.toLowerCase() !== "pro bowl");
        await upsertDBSportLeagueWeeks(
          regularSeasonESPNWeeks.map((espnWeek) => ({
            seasonId: dbSportLeagueSeason.id,
            name: espnWeek.text,
            startTime: new Date(espnWeek.startDate),
            endTime: new Date(espnWeek.endDate),
            espnEventsRef: espnWeek.events.$ref,
            type: SportLeagueWeekTypes.REGULAR_SEASON,
          })),
          true,
          tx,
        );
        await upsertDBSportLeagueWeeks(
          postSeasonESPNWeeks.map((espnWeek) => ({
            seasonId: dbSportLeagueSeason.id,
            name: espnWeek.text,
            startTime: new Date(espnWeek.startDate),
            endTime: new Date(espnWeek.endDate),
            espnEventsRef: espnWeek.events.$ref,
            type: SportLeagueWeekTypes.PLAYOFFS,
          })),
          true,
          tx,
        );
      }
    });
  } catch (e) {
    console.error(e);
  }

  return Response.json({
    success: true,
  });
}

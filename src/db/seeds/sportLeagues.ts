import { getESPNSportTeams } from "@/integrations/espn/sportLeagueTeams";
import { scriptDB } from "@/db/scriptClient";
import {
  sportLeagues,
  sportSeasons,
  sportTeams,
  sportWeeks,
} from "@/db/schema";
import { ExtractTablesWithRelations, sql } from "drizzle-orm";
import { getESPNSportLeagues } from "@/integrations/espn/sportLeagues";
import { ESPNLeagueSlug, ESPNSportSlug } from "@/integrations/espn/types";
import { getActiveESPNSportLeagueSeason } from "@/integrations/espn/sportLeagueSeasons";
import {
  ESPNSeasonType,
  getESPNSportLeagueSeasonWeeks,
} from "@/integrations/espn/sportLeagueSeasonWeeks";
import { SQLiteTransaction } from "drizzle-orm/sqlite-core";
import { ResultSet } from "@libsql/client";

async function main() {
  try {
    await scriptDB.transaction(async (tx) => {
      const espnSportLeagues = await getESPNSportLeagues(
        ESPNSportSlug.FOOTBALL,
      );
      const dbSportLeagues = await upsertDBSportLeagues(
        tx,
        espnSportLeagues.map((sportLeague) => ({
          name: sportLeague.name,
          abbreviation: sportLeague.abbreviation,
          logoUrl: sportLeague.logos.length
            ? sportLeague.logos[0].href
            : undefined,
          espnId: sportLeague.id,
          espnSlug: sportLeague.slug,
        })),
      );

      const espnSeasonNameToSportLeagueIdMap = new Map<string, string>();
      const espnLeagueIdToSeasonDisplayNameMap = new Map<string, string>();
      const sportLeagueIdToESPNSlugMap = new Map<string, string>();
      let espnSportSeasons = [];
      for (const dbSportLeague of dbSportLeagues) {
        const sportSeason = await getActiveESPNSportLeagueSeason(
          ESPNSportSlug.FOOTBALL,
          dbSportLeague.espnSlug as ESPNLeagueSlug,
        );
        if (sportSeason) {
          espnSportSeasons.push(sportSeason);
          espnSeasonNameToSportLeagueIdMap.set(
            sportSeason.displayName,
            dbSportLeague.id,
          );
          espnLeagueIdToSeasonDisplayNameMap.set(
            dbSportLeague.espnId!,
            sportSeason.displayName,
          );
          sportLeagueIdToESPNSlugMap.set(
            dbSportLeague.id,
            dbSportLeague.espnSlug!,
          );
        } else {
          throw new Error(
            `Unable to get active espn sport season with slug "${dbSportLeague.espnSlug}"`,
          );
        }

        const espnSportTeams = await getESPNSportTeams([
          {
            sport: ESPNSportSlug.FOOTBALL,
            league: dbSportLeague.espnSlug as ESPNLeagueSlug,
            seasonDisplayName: espnLeagueIdToSeasonDisplayNameMap.get(
              dbSportLeague.espnId!,
            )!,
          },
        ]);
        await upsertDBSportTeams(
          tx,
          espnSportTeams.map((espnSportTeam) => ({
            sportLeagueId: dbSportLeague.id,
            name: espnSportTeam.name,
            espnId: espnSportTeam.id,
            location: espnSportTeam.location,
            abbreviation: espnSportTeam.abbreviation,
            logoUrl: espnSportTeam.logos.length
              ? espnSportTeam.logos[0].href
              : undefined,
          })),
        );
      }

      const dbSportSeasons = await upsertDBSportSeasons(
        tx,
        espnSportSeasons.map((sportSeason) => ({
          sportLeagueId: espnSeasonNameToSportLeagueIdMap.get(
            sportSeason.displayName,
          )!,
          name: sportSeason.displayName,
          startTime: new Date(sportSeason.startDate),
          endTime: new Date(sportSeason.endDate),
          active: true,
          espnDisplayName: sportSeason.displayName,
        })),
      );

      for (const dbSportSeason of dbSportSeasons) {
        const regularSeasonESPNWeeks = await getESPNSportLeagueSeasonWeeks(
          ESPNSportSlug.FOOTBALL,
          sportLeagueIdToESPNSlugMap.get(
            dbSportSeason.sportLeagueId,
          )! as ESPNLeagueSlug,
          dbSportSeason.espnDisplayName!,
          ESPNSeasonType.REGULAR_SEASON,
        );
        const postSeasonESPNWeeks = await getESPNSportLeagueSeasonWeeks(
          ESPNSportSlug.FOOTBALL,
          sportLeagueIdToESPNSlugMap.get(
            dbSportSeason.sportLeagueId,
          )! as ESPNLeagueSlug,
          dbSportSeason.espnDisplayName!,
          ESPNSeasonType.POST_SEASON,
        );
        const allESPNWeeks = [
          ...regularSeasonESPNWeeks,
          ...postSeasonESPNWeeks,
        ];

        await upsertSportWeeks(
          tx,
          allESPNWeeks.map((espnWeek) => ({
            seasonId: dbSportSeason.id,
            name: espnWeek.text,
            startTime: new Date(espnWeek.startDate),
            endTime: new Date(espnWeek.endDate),
            espnNumber: espnWeek.number,
          })),
        );
      }
    });
  } catch (e) {
    console.error(e);
  }
}

type Transaction = SQLiteTransaction<
  "async",
  ResultSet,
  Record<string, never>,
  ExtractTablesWithRelations<Record<string, never>>
>;

interface UpsertDBSportLeague {
  name: string;
  abbreviation: string;
  logoUrl?: string;
  espnId?: string;
  espnSlug?: string;
}

async function upsertDBSportLeagues(
  tx: Transaction,
  upserts: UpsertDBSportLeague[],
) {
  return tx
    .insert(sportLeagues)
    .values(upserts)
    .onConflictDoUpdate({
      target: [sportLeagues.name],
      set: {
        name: sql`excluded.name`,
        abbreviation: sql`excluded.abbreviation`,
        logoUrl: sql`excluded.logo_url`,
        espnSlug: sql`excluded.espn_slug`,
      },
    })
    .returning();
}

interface UpsertDBSportSeason {
  sportLeagueId: string;
  name: string;
  startTime: Date;
  endTime: Date;
  active: boolean;
  espnDisplayName?: string;
}

async function upsertDBSportSeasons(
  tx: Transaction,
  upserts: UpsertDBSportSeason[],
) {
  return tx
    .insert(sportSeasons)
    .values(upserts)
    .onConflictDoUpdate({
      target: [sportSeasons.sportLeagueId, sportSeasons.espnDisplayName],
      set: {
        name: sql`excluded.name`,
        startTime: sql`excluded.start_time`,
        endTime: sql`excluded.end_time`,
        active: sql`excluded.active`,
      },
    })
    .returning();
}

interface UpsertDBSportWeek {
  seasonId: string;
  name: string;
  startTime: Date;
  endTime: Date;
  espnNumber?: number;
}

async function upsertSportWeeks(tx: Transaction, upserts: UpsertDBSportWeek[]) {
  return tx
    .insert(sportWeeks)
    .values(upserts)
    .onConflictDoUpdate({
      target: [sportWeeks.seasonId, sportWeeks.name],
      set: {
        startTime: sql`excluded.start_time`,
        endTime: sql`excluded.end_time`,
        espnNumber: sql`excluded.espn_number`,
      },
    })
    .returning();
}

interface UpsertDBSportTeam {
  sportLeagueId: string;
  name: string;
  location: string;
  abbreviation: string;
  logoUrl?: string;
  espnId?: string;
}

async function upsertDBSportTeams(
  tx: Transaction,
  upserts: UpsertDBSportTeam[],
) {
  return tx
    .insert(sportTeams)
    .values(upserts)
    .onConflictDoUpdate({
      target: [sportTeams.sportLeagueId, sportTeams.espnId],
      set: {
        name: sql`excluded.name`,
        location: sql`excluded.location`,
        abbreviation: sql`excluded.abbreviation`,
        logoUrl: sql`excluded.logo_url`,
      },
    })
    .returning();
}

void main();

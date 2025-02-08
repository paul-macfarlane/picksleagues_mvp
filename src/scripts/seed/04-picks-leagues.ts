import { DBPicksLeague } from "@/db/picksLeagues";
import {
  picksLeagues,
  picksLeagueMembers,
  picksLeagueSeasons,
  users,
  picksLeaguePicks,
  picksLeagueStandings,
  sportLeagueGameOdds,
  sportLeagueWeeks,
  sportLeagueGames,
} from "@/db/schema";
import { PicksLeagueMemberRoles } from "@/models/picksLeagueMembers";
import {
  PicksLeaguePickTypes,
  PicksLeagueVisibilities,
} from "@/models/picksLeagues";
import { PicksLeaguePickStatuses } from "@/shared/picksLeaguePicks";
import { and, eq, sql, gte, lte, inArray, desc } from "drizzle-orm";
import { DBTransaction } from "@/db/transactions";
import { SportLeagueGameStatuses } from "@/models/sportLeagueGames";
import { DBSportLeagueGame } from "@/db/sportLeagueGames";
import { DBSportLeagueGameOdds } from "@/db/sportLeagueGameOdds";

interface CreatePicksLeagueConfig {
  name: string;
  sportLeagueId: string;
  visibility: (typeof PicksLeagueVisibilities)[keyof typeof PicksLeagueVisibilities];
  pickType: (typeof PicksLeaguePickTypes)[keyof typeof PicksLeaguePickTypes];
  size: number;
  picksPerWeek: number;
  seasonIds: string[];
}

export async function seedPicksLeagues(
  configs: CreatePicksLeagueConfig[],
  tx: DBTransaction,
) {
  const leagues: DBPicksLeague[] = [];

  const testUsers = [];
  for (let i = 0; i < 20; i++) {
    const user = await tx
      .insert(users)
      .values({
        email: `test${i + 1}@example.com`,
        firstName: `Test${i + 1}`,
        lastName: `User${i + 1}`,
        username: `testuser${i + 1}`,
      })
      .returning()
      .get();
    testUsers.push(user);
  }

  for (const config of configs) {
    const league = await tx
      .insert(picksLeagues)
      .values({
        name: config.name,
        sportLeagueId: config.sportLeagueId,
        picksPerWeek: config.picksPerWeek,
        pickType: config.pickType,
        visibility: config.visibility,
        size: config.size,
      })
      .returning()
      .get();

    if (config.seasonIds.length > 0) {
      for (const seasonId of config.seasonIds) {
        const weeks = await tx
          .select()
          .from(sportLeagueWeeks)
          .where(eq(sportLeagueWeeks.seasonId, seasonId))
          .all();

        await tx.insert(picksLeagueSeasons).values({
          leagueId: league.id,
          sportLeagueSeasonId: seasonId,
          startSportLeagueWeekId: weeks[0]!.id,
          endSportLeagueWeekId: weeks[weeks.length - 1]!.id,
        });
      }
    }

    const shuffledUsers = [...testUsers].sort(() => Math.random() - 0.5);
    const memberCount = Math.min(config.size, shuffledUsers.length);

    for (let i = 0; i < memberCount - 1; i++) {
      const user = shuffledUsers[i];
      await tx
        .insert(picksLeagueMembers)
        .values({
          userId: user.id,
          leagueId: league.id,
          role:
            i === 0
              ? PicksLeagueMemberRoles.COMMISSIONER
              : PicksLeagueMemberRoles.MEMBER,
        })
        .onConflictDoUpdate({
          target: [picksLeagueMembers.userId, picksLeagueMembers.leagueId],
          set: {
            role: sql`excluded.role`,
          },
        });
    }
    // make default user commissioner of leagues
    const myUserRows = await tx
      .select()
      .from(users)
      .where(eq(users.email, "pauljosephmacfarlane@gmail.com"));
    if (!myUserRows.length) {
      throw new Error("missing user with email pauljosephmacfarlane@gmail.com");
    }

    await tx
      .insert(picksLeagueMembers)
      .values({
        userId: myUserRows[0].id,
        leagueId: league.id,
        role: PicksLeagueMemberRoles.COMMISSIONER,
      })
      .onConflictDoUpdate({
        target: [picksLeagueMembers.userId, picksLeagueMembers.leagueId],
        set: {
          role: sql`excluded.role`,
        },
      });

    leagues.push(league);
  }

  return leagues;
}

function determinePickStatus(
  game: DBSportLeagueGame,
  pickType: (typeof PicksLeaguePickTypes)[keyof typeof PicksLeaguePickTypes],
  odds: DBSportLeagueGameOdds,
  pickedTeamId: string,
): PicksLeaguePickStatuses {
  if (!game || game.status !== SportLeagueGameStatuses.FINAL) {
    return PicksLeaguePickStatuses.PICKED;
  }

  const homeTeamScore = game.homeTeamScore;
  const awayTeamScore = game.awayTeamScore;
  const pickedHomeTeam = pickedTeamId === game.homeTeamId;

  if (pickType === PicksLeaguePickTypes.STRAIGHT_UP) {
    const homeWon = homeTeamScore > awayTeamScore;
    return pickedHomeTeam === homeWon
      ? PicksLeaguePickStatuses.WIN
      : homeTeamScore === awayTeamScore
        ? PicksLeaguePickStatuses.PUSH
        : PicksLeaguePickStatuses.LOSS;
  } else {
    if (!odds) {
      console.log("No odds found for game", game.id);
      return PicksLeaguePickStatuses.PICKED;
    }

    const spread = odds.spread;
    const favoredTeamId = odds.favoriteTeamId;
    const favoredTeamIsHome = favoredTeamId === game.homeTeamId;

    let effectiveHomeScore = homeTeamScore;
    let effectiveAwayScore = awayTeamScore;

    if (favoredTeamIsHome) {
      effectiveHomeScore -= spread;
    } else {
      effectiveAwayScore -= spread;
    }

    if (pickedHomeTeam) {
      if (effectiveHomeScore > effectiveAwayScore) {
        return PicksLeaguePickStatuses.WIN;
      } else if (effectiveHomeScore === effectiveAwayScore) {
        return PicksLeaguePickStatuses.PUSH;
      } else {
        return PicksLeaguePickStatuses.LOSS;
      }
    } else {
      if (effectiveAwayScore > effectiveHomeScore) {
        return PicksLeaguePickStatuses.WIN;
      } else if (effectiveAwayScore === effectiveHomeScore) {
        return PicksLeaguePickStatuses.PUSH;
      } else {
        return PicksLeaguePickStatuses.LOSS;
      }
    }
  }
}

export async function seedPicksLeaguePicks({
  leagueId,
  weekId,
  pickType,
  tx,
}: {
  leagueId: string;
  weekId: string;
  pickType: (typeof PicksLeaguePickTypes)[keyof typeof PicksLeaguePickTypes];
  tx: DBTransaction;
}) {
  const members = await tx
    .select()
    .from(picksLeagueMembers)
    .where(eq(picksLeagueMembers.leagueId, leagueId));

  const fullGames = await tx
    .select()
    .from(sportLeagueGames)
    .where(eq(sportLeagueGames.weekId, weekId));

  const oddsMap = new Map();
  if (pickType === PicksLeaguePickTypes.AGAINST_THE_SPREAD) {
    const allOdds = await tx
      .select()
      .from(sportLeagueGameOdds)
      .where(
        inArray(
          sportLeagueGameOdds.gameId,
          fullGames.map((game) => game.id),
        ),
      )
      .all();

    allOdds.forEach((odds) => {
      oddsMap.set(odds.gameId, odds);
    });
  }

  const picksToInsert = [];
  for (const member of members) {
    // Randomly select games to pick
    const shuffledGames = [...fullGames].sort(() => Math.random() - 0.5);
    const pickedGames = shuffledGames.slice(0, 3); // Each member picks 3 games

    for (const game of pickedGames) {
      if (!game) continue;

      const odds =
        pickType === PicksLeaguePickTypes.AGAINST_THE_SPREAD
          ? oddsMap.get(game.id)
          : null;

      // Randomly pick home or away team
      const pickHomeTeam = Math.random() < 0.5;
      const teamId = pickHomeTeam ? game.homeTeamId : game.awayTeamId;

      // Determine pick status based on game status, scores, and spread
      const status = determinePickStatus(game, pickType, odds, teamId);

      picksToInsert.push({
        userId: member.userId,
        leagueId,
        sportLeagueWeekId: weekId,
        sportLeagueGameId: game.id,
        type: pickType,
        teamId,
        status,
        // Add spread info for against the spread picks
        ...(pickType === PicksLeaguePickTypes.AGAINST_THE_SPREAD && odds
          ? {
              spread: odds.spread,
              favorite: teamId === odds.favoriteTeamId,
            }
          : {}),
      });
    }
  }

  if (picksToInsert.length > 0) {
    await tx.insert(picksLeaguePicks).values(picksToInsert);
  }
}

export async function updatePicksLeagueStandings({
  leagueId,
  seasonId,
  tx,
}: {
  leagueId: string;
  seasonId: string;
  tx: DBTransaction;
}) {
  const picksLeagueSeason = await tx
    .select()
    .from(picksLeagueSeasons)
    .where(
      and(
        eq(picksLeagueSeasons.leagueId, leagueId),
        eq(picksLeagueSeasons.sportLeagueSeasonId, seasonId),
      ),
    )
    .get();

  if (!picksLeagueSeason) {
    console.log(
      `No picks league season found for season ${seasonId} in league ${leagueId}`,
    );
    return;
  }

  const members = await tx
    .select()
    .from(picksLeagueMembers)
    .where(eq(picksLeagueMembers.leagueId, leagueId));

  for (const member of members) {
    const weeks = await tx
      .select()
      .from(sportLeagueWeeks)
      .where(
        and(
          eq(sportLeagueWeeks.seasonId, seasonId),
          gte(sportLeagueWeeks.id, picksLeagueSeason.startSportLeagueWeekId),
          lte(sportLeagueWeeks.id, picksLeagueSeason.endSportLeagueWeekId),
        ),
      )
      .all();

    const weekIds = weeks.map((week) => week.id);
    const picks = await tx
      .select()
      .from(picksLeaguePicks)
      .where(
        and(
          eq(picksLeaguePicks.leagueId, leagueId),
          eq(picksLeaguePicks.userId, member.userId),
          inArray(picksLeaguePicks.sportLeagueWeekId, weekIds),
        ),
      );

    const wins = picks.filter(
      (p) => p.status === PicksLeaguePickStatuses.WIN,
    ).length;
    const losses = picks.filter(
      (p) => p.status === PicksLeaguePickStatuses.LOSS,
    ).length;
    const pushes = picks.filter(
      (p) => p.status === PicksLeaguePickStatuses.PUSH,
    ).length;

    const points = wins + pushes * 0.5;
    await tx
      .insert(picksLeagueStandings)
      .values({
        userId: member.userId,
        seasonId: picksLeagueSeason.id,
        wins,
        losses,
        pushes,
        points,
        // Rank will be updated by a separate function that orders by points
        rank: 1,
      })
      .onConflictDoUpdate({
        target: [picksLeagueStandings.userId, picksLeagueStandings.seasonId],
        set: {
          wins: sql`excluded.wins`,
          losses: sql`excluded.losses`,
          pushes: sql`excluded.pushes`,
          points: sql`excluded.points`,
        },
      });
  }

  // Update ranks based on points
  const standings = await tx
    .select()
    .from(picksLeagueStandings)
    .where(eq(picksLeagueStandings.seasonId, picksLeagueSeason.id))
    .orderBy(desc(picksLeagueStandings.points));

  for (let i = 0; i < standings.length; i++) {
    await tx
      .update(picksLeagueStandings)
      .set({ rank: i + 1 })
      .where(eq(picksLeagueStandings.id, standings[i].id));
  }
}

import { seedSportLeaguesAndTeams } from "./01-sport-leagues";
import { createSeasonConfigs, seedSportSeasons } from "./02-sport-seasons";
import { seedSportGames } from "./03-sport-games";
import {
  seedPicksLeagues,
  seedPicksLeaguePicks,
  updatePicksLeagueStandings,
} from "./04-picks-leagues";
import {
  PicksLeaguePickTypes,
  PicksLeagueVisibilities,
} from "@/models/picksLeagues";
import { DateTime } from "luxon";
import { scriptDB as db } from "@/db/scriptClient";

// todo this is like half functional half not, good start, but need to investigate code a little more before resuming ai use

async function main() {
  try {
    console.log("🌱 Starting seed process...");

    await db.transaction(async (tx) => {
      console.log("Creating sport leagues and teams...");
      const { nflLeague, ncaaLeague } = await seedSportLeaguesAndTeams(tx);

      console.log("Creating seasons...");
      const seasonConfigs = createSeasonConfigs();

      const nflSeasons = await seedSportSeasons({
        leagueId: nflLeague.id,
        seasonConfigs,
        tx,
      });

      const ncaaSeasons = await seedSportSeasons({
        leagueId: ncaaLeague.id,
        seasonConfigs,
        tx,
      });

      console.log("Creating games...");
      for (const { season, weeks } of [...nflSeasons, ...ncaaSeasons]) {
        for (const week of weeks) {
          await seedSportGames({
            weekId: week.id,
            leagueId: season.leagueId,
            weekStart: DateTime.fromMillis(week.startTime.getTime()),
            tx,
          });
        }
      }

      console.log("Creating picks leagues...");

      const nflPicksLeagues = await seedPicksLeagues(
        [
          {
            name: "NFL Picks - Straight Up (Current Season)",
            sportLeagueId: nflLeague.id,
            visibility: PicksLeagueVisibilities.PUBLIC,
            pickType: PicksLeaguePickTypes.STRAIGHT_UP,
            size: 12,
            picksPerWeek: 3,
            seasonIds: [nflSeasons[1].season.id],
          },
          {
            name: "NFL Picks - Against the Spread (Current Season)",
            sportLeagueId: nflLeague.id,
            visibility: PicksLeagueVisibilities.PRIVATE,
            pickType: PicksLeaguePickTypes.AGAINST_THE_SPREAD,
            size: 10,
            picksPerWeek: 3,
            seasonIds: [nflSeasons[1].season.id],
          },
          {
            name: "NFL Picks - Previous Season",
            sportLeagueId: nflLeague.id,
            visibility: PicksLeagueVisibilities.PUBLIC,
            pickType: PicksLeaguePickTypes.STRAIGHT_UP,
            size: 8,
            picksPerWeek: 3,
            seasonIds: [nflSeasons[0].season.id],
          },
          {
            name: "NFL Picks - Future Season",
            sportLeagueId: nflLeague.id,
            visibility: PicksLeagueVisibilities.PUBLIC,
            pickType: PicksLeaguePickTypes.STRAIGHT_UP,
            size: 15,
            picksPerWeek: 3,
            seasonIds: [nflSeasons[2].season.id],
          },
        ],
        tx,
      );

      const ncaaPicksLeagues = await seedPicksLeagues(
        [
          {
            name: "College Football Picks (Current Season)",
            sportLeagueId: ncaaLeague.id,
            visibility: PicksLeagueVisibilities.PUBLIC,
            pickType: PicksLeaguePickTypes.STRAIGHT_UP,
            size: 12,
            picksPerWeek: 3,
            seasonIds: [ncaaSeasons[1].season.id],
          },
          {
            name: "College Football Picks (Previous Season)",
            sportLeagueId: ncaaLeague.id,
            visibility: PicksLeagueVisibilities.PRIVATE,
            pickType: PicksLeaguePickTypes.AGAINST_THE_SPREAD,
            size: 10,
            picksPerWeek: 3,
            seasonIds: [ncaaSeasons[0].season.id],
          },
        ],
        tx,
      );

      console.log("Creating picks and standings...");
      for (const league of [...nflPicksLeagues, ...ncaaPicksLeagues]) {
        // Get the league's season and weeks
        const isNFLLeague = league.sportLeagueId === nflLeague.id;
        const seasons = isNFLLeague ? nflSeasons : ncaaSeasons;

        for (const { season, weeks } of seasons) {
          for (const week of weeks) {
            if (week.endTime < new Date()) {
              await seedPicksLeaguePicks({
                leagueId: league.id,
                weekId: week.id,
                pickType: league.pickType,
                tx,
              });
            }
          }

          await updatePicksLeagueStandings({
            leagueId: league.id,
            seasonId: season.id,
            tx,
          });
        }
      }
    });

    console.log("✅ Seed process completed successfully!");
  } catch (error) {
    console.error("❌ Error during seed process:", error);
    process.exit(1);
  }
}

main();

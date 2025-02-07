import { sportLeagues, sportLeagueTeams } from "@/db/schema";
import { ESPNLeagueSlug, ESPNSportSlug } from "@/integrations/espn/shared";
import { sql } from "drizzle-orm";
import { DBTransaction } from "@/db/transactions";

export async function seedSportLeagues(tx: DBTransaction) {
  const nflLeague = await tx
    .insert(sportLeagues)
    .values({
      name: "National Fake Football League",
      abbreviation: "NFFL",
      logoUrl: "https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png",
      espnId: "28",
      espnSlug: ESPNLeagueSlug.NFL,
      espnSportSlug: ESPNSportSlug.FOOTBALL,
    })
    .onConflictDoUpdate({
      target: [sportLeagues.name],
      set: {
        name: sql`excluded.name`,
        abbreviation: sql`excluded.abbreviation`,
        logoUrl: sql`excluded.logo_url`,
        espnId: sql`excluded.espn_id`,
        espnSlug: sql`excluded.espn_slug`,
        espnSportSlug: sql`excluded.espn_sport_slug`,
      },
    })
    .returning()
    .get();
  const nflTeams = [
    {
      name: "Buffalo Bills",
      location: "Buffalo",
      abbreviation: "BUF",
      espnId: "2",
    },
    {
      name: "Miami Dolphins",
      location: "Miami",
      abbreviation: "MIA",
      espnId: "15",
    },
    {
      name: "New England Patriots",
      location: "New England",
      abbreviation: "NE",
      espnId: "17",
    },
    {
      name: "New York Jets",
      location: "New York",
      abbreviation: "NYJ",
      espnId: "20",
    },
    {
      name: "Baltimore Ravens",
      location: "Baltimore",
      abbreviation: "BAL",
      espnId: "33",
    },
    {
      name: "Cincinnati Bengals",
      location: "Cincinnati",
      abbreviation: "CIN",
      espnId: "4",
    },
    {
      name: "Cleveland Browns",
      location: "Cleveland",
      abbreviation: "CLE",
      espnId: "5",
    },
    {
      name: "Pittsburgh Steelers",
      location: "Pittsburgh",
      abbreviation: "PIT",
      espnId: "23",
    },
    {
      name: "Houston Texans",
      location: "Houston",
      abbreviation: "HOU",
      espnId: "34",
    },
    {
      name: "Indianapolis Colts",
      location: "Indianapolis",
      abbreviation: "IND",
      espnId: "11",
    },
    {
      name: "Jacksonville Jaguars",
      location: "Jacksonville",
      abbreviation: "JAX",
      espnId: "30",
    },
    {
      name: "Tennessee Titans",
      location: "Tennessee",
      abbreviation: "TEN",
      espnId: "10",
    },
    {
      name: "Denver Broncos",
      location: "Denver",
      abbreviation: "DEN",
      espnId: "7",
    },
    {
      name: "Kansas City Chiefs",
      location: "Kansas City",
      abbreviation: "KC",
      espnId: "12",
    },
    {
      name: "Las Vegas Raiders",
      location: "Las Vegas",
      abbreviation: "LV",
      espnId: "13",
    },
    {
      name: "Los Angeles Chargers",
      location: "Los Angeles",
      abbreviation: "LAC",
      espnId: "24",
    },
    {
      name: "Dallas Cowboys",
      location: "Dallas",
      abbreviation: "DAL",
      espnId: "6",
    },
    {
      name: "New York Giants",
      location: "New York",
      abbreviation: "NYG",
      espnId: "19",
    },
    {
      name: "Philadelphia Eagles",
      location: "Philadelphia",
      abbreviation: "PHI",
      espnId: "21",
    },
    {
      name: "Washington Commanders",
      location: "Washington",
      abbreviation: "WSH",
      espnId: "28",
    },
    {
      name: "Chicago Bears",
      location: "Chicago",
      abbreviation: "CHI",
      espnId: "3",
    },
    {
      name: "Detroit Lions",
      location: "Detroit",
      abbreviation: "DET",
      espnId: "8",
    },
    {
      name: "Green Bay Packers",
      location: "Green Bay",
      abbreviation: "GB",
      espnId: "9",
    },
    {
      name: "Minnesota Vikings",
      location: "Minnesota",
      abbreviation: "MIN",
      espnId: "16",
    },
    {
      name: "Atlanta Falcons",
      location: "Atlanta",
      abbreviation: "ATL",
      espnId: "1",
    },
    {
      name: "Carolina Panthers",
      location: "Carolina",
      abbreviation: "CAR",
      espnId: "29",
    },
    {
      name: "New Orleans Saints",
      location: "New Orleans",
      abbreviation: "NO",
      espnId: "18",
    },
    {
      name: "Tampa Bay Buccaneers",
      location: "Tampa Bay",
      abbreviation: "TB",
      espnId: "27",
    },
    {
      name: "Arizona Cardinals",
      location: "Arizona",
      abbreviation: "ARI",
      espnId: "22",
    },
    {
      name: "Los Angeles Rams",
      location: "Los Angeles",
      abbreviation: "LAR",
      espnId: "14",
    },
    {
      name: "San Francisco 49ers",
      location: "San Francisco",
      abbreviation: "SF",
      espnId: "25",
    },
    {
      name: "Seattle Seahawks",
      location: "Seattle",
      abbreviation: "SEA",
      espnId: "26",
    },
  ];

  await tx
    .insert(sportLeagueTeams)
    .values(
      nflTeams.map((team) => ({
        leagueId: nflLeague.id,
        name: team.name,
        location: team.location,
        abbreviation: team.abbreviation,
        logoUrl: `https://a.espncdn.com/i/teamlogos/nfl/500/${team.abbreviation.toLowerCase()}.png`,
        espnId: team.espnId,
      })),
    )
    .onConflictDoUpdate({
      target: [sportLeagueTeams.leagueId, sportLeagueTeams.espnId],
      set: {
        name: sql`excluded.name`,
        location: sql`excluded.location`,
        abbreviation: sql`excluded.abbreviation`,
        logoUrl: sql`excluded.logo_url`,
        espnId: sql`excluded.espn_id`,
      },
    });

  const ncaaLeague = await tx
    .insert(sportLeagues)
    .values({
      name: "NCAA Fake Football",
      abbreviation: "NCAAFF",
      logoUrl: "https://a.espncdn.com/i/teamlogos/leagues/500/ncaa.png",
      espnId: "23",
      espnSlug: ESPNLeagueSlug.COLLEGE_FOOTBALL,
      espnSportSlug: ESPNSportSlug.FOOTBALL,
    })
    .onConflictDoUpdate({
      target: [sportLeagues.name],
      set: {
        name: sql`excluded.name`,
        abbreviation: sql`excluded.abbreviation`,
        logoUrl: sql`excluded.logo_url`,
        espnId: sql`excluded.espn_id`,
        espnSlug: sql`excluded.espn_slug`,
        espnSportSlug: sql`excluded.espn_sport_slug`,
      },
    })
    .returning()
    .get();
  const ncaaTeams = [
    {
      name: "Georgia Bulldogs",
      location: "Georgia",
      abbreviation: "UGA",
      espnId: "61",
    },
    {
      name: "Michigan Wolverines",
      location: "Michigan",
      abbreviation: "MICH",
      espnId: "130",
    },
    {
      name: "Alabama Crimson Tide",
      location: "Alabama",
      abbreviation: "ALA",
      espnId: "333",
    },
    {
      name: "Texas Longhorns",
      location: "Texas",
      abbreviation: "TEX",
      espnId: "251",
    },
    {
      name: "Ohio State Buckeyes",
      location: "Ohio State",
      abbreviation: "OSU",
      espnId: "194",
    },
    {
      name: "Florida State Seminoles",
      location: "Florida State",
      abbreviation: "FSU",
      espnId: "52",
    },
    {
      name: "Washington Huskies",
      location: "Washington",
      abbreviation: "WASH",
      espnId: "264",
    },
    {
      name: "Oregon Ducks",
      location: "Oregon",
      abbreviation: "ORE",
      espnId: "2483",
    },
    {
      name: "Missouri Tigers",
      location: "Missouri",
      abbreviation: "MIZZ",
      espnId: "142",
    },
    {
      name: "Penn State Nittany Lions",
      location: "Penn State",
      abbreviation: "PSU",
      espnId: "213",
    },
    {
      name: "Ole Miss Rebels",
      location: "Ole Miss",
      abbreviation: "MISS",
      espnId: "145",
    },
    {
      name: "Oklahoma Sooners",
      location: "Oklahoma",
      abbreviation: "OKLA",
      espnId: "201",
    },
    {
      name: "LSU Tigers",
      location: "LSU",
      abbreviation: "LSU",
      espnId: "99",
    },
    {
      name: "Arizona Wildcats",
      location: "Arizona",
      abbreviation: "ARIZ",
      espnId: "12",
    },
    {
      name: "Louisville Cardinals",
      location: "Louisville",
      abbreviation: "LOU",
      espnId: "97",
    },
    {
      name: "Notre Dame Fighting Irish",
      location: "Notre Dame",
      abbreviation: "ND",
      espnId: "87",
    },
    {
      name: "Oklahoma State Cowboys",
      location: "Oklahoma State",
      abbreviation: "OKST",
      espnId: "197",
    },
    {
      name: "Tennessee Volunteers",
      location: "Tennessee",
      abbreviation: "TENN",
      espnId: "2633",
    },
    {
      name: "Tulane Green Wave",
      location: "Tulane",
      abbreviation: "TUL",
      espnId: "2655",
    },
    {
      name: "Utah Utes",
      location: "Utah",
      abbreviation: "UTAH",
      espnId: "254",
    },
    {
      name: "Kansas State Wildcats",
      location: "Kansas State",
      abbreviation: "KSU",
      espnId: "2306",
    },
    {
      name: "Iowa Hawkeyes",
      location: "Iowa",
      abbreviation: "IOWA",
      espnId: "2294",
    },
    {
      name: "Clemson Tigers",
      location: "Clemson",
      abbreviation: "CLEM",
      espnId: "228",
    },
    {
      name: "Oregon State Beavers",
      location: "Oregon State",
      abbreviation: "ORST",
      espnId: "204",
    },
    {
      name: "North Carolina State Wolfpack",
      location: "NC State",
      abbreviation: "NCST",
      espnId: "152",
    },
    {
      name: "SMU Mustangs",
      location: "SMU",
      abbreviation: "SMU",
      espnId: "2567",
    },
    {
      name: "Kansas Jayhawks",
      location: "Kansas",
      abbreviation: "KU",
      espnId: "2305",
    },
    {
      name: "West Virginia Mountaineers",
      location: "West Virginia",
      abbreviation: "WVU",
      espnId: "277",
    },
    {
      name: "Duke Blue Devils",
      location: "Duke",
      abbreviation: "DUKE",
      espnId: "150",
    },
    {
      name: "Miami Hurricanes",
      location: "Miami",
      abbreviation: "MIA",
      espnId: "2390",
    },
    {
      name: "USC Trojans",
      location: "USC",
      abbreviation: "USC",
      espnId: "30",
    },
    {
      name: "Texas A&M Aggies",
      location: "Texas A&M",
      abbreviation: "TAMU",
      espnId: "245",
    },
  ];

  await tx
    .insert(sportLeagueTeams)
    .values(
      ncaaTeams.map((team) => ({
        leagueId: ncaaLeague.id,
        name: team.name,
        location: team.location,
        abbreviation: team.abbreviation,
        logoUrl: `https://a.espncdn.com/i/teamlogos/ncaa/500/${team.abbreviation.toLowerCase()}.png`,
        espnId: team.espnId,
      })),
    )
    .onConflictDoUpdate({
      target: [sportLeagueTeams.leagueId, sportLeagueTeams.espnId],
      set: {
        name: sql`excluded.name`,
        location: sql`excluded.location`,
        abbreviation: sql`excluded.abbreviation`,
        logoUrl: sql`excluded.logo_url`,
        espnId: sql`excluded.espn_id`,
      },
    });

  return {
    nflLeague,
    ncaaLeague,
  };
}

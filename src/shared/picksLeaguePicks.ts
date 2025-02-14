import { SportLeagueGameStatuses } from "@/models/sportLeagueGames";
import { DbWeeklyPickGameData } from "@/db/sportLeagueWeeks";
import { DBSportLeagueGame } from "@/db/sportLeagueGames";
import { DBPicksLeaguePick } from "@/db/picksLeaguesPicks";
import { formatDateTime } from "./utils";

export enum PicksLeaguePickStatuses {
  WIN = "Win",
  PUSH = "Push",
  LOSS = "Loss",
  PICKED = "Picked",
  UNPICKED = "Unpicked",
}

export function getGamePickStatus(
  game: DBSportLeagueGame,
  pick: DBPicksLeaguePick | null,
): PicksLeaguePickStatuses {
  if (!pick) {
    return PicksLeaguePickStatuses.UNPICKED;
  }

  if (pick.status !== PicksLeaguePickStatuses.PICKED) {
    // status was already calculated via standings calculator
    return pick.status;
  }

  if (game.status !== SportLeagueGameStatuses.FINAL) {
    return PicksLeaguePickStatuses.PICKED;
  }

  const pointDifferential =
    game.homeTeamId === pick.teamId
      ? game.homeTeamScore - game.awayTeamScore
      : game.awayTeamScore - game.homeTeamScore;
  const spreadAdjustment = pick.spread
    ? pick.favorite
      ? pick.spread!
      : pick.spread! * -1
    : 0;

  if (pointDifferential - spreadAdjustment > 0) {
    return PicksLeaguePickStatuses.WIN;
  } else if (pointDifferential - spreadAdjustment === 0) {
    return PicksLeaguePickStatuses.PUSH;
  } else {
    return PicksLeaguePickStatuses.LOSS;
  }
}

export function getGamePickSpreadDisplay(
  game: DbWeeklyPickGameData,
  homeAway: "HOME" | "AWAY",
): string {
  let sign;
  if (game.userPick && homeAway === "HOME") {
    if (game.userPick.teamId === game.homeTeamId) {
      sign = game.userPick.favorite ? "-" : "+";
    } else {
      sign = game.userPick.favorite ? "+" : "-";
    }
  } else if (game.userPick) {
    if (game.userPick.teamId === game.awayTeamId) {
      sign = game.userPick.favorite ? "-" : "+";
    } else {
      sign = game.userPick.favorite ? "+" : "-";
    }
  } else if (homeAway === "HOME") {
    sign = game.odds[0].favoriteTeamId === game.homeTeamId ? "-" : "+";
  } else {
    sign = game.odds[0].favoriteTeamId === game.awayTeamId ? "-" : "+";
  }

  return `${sign}${game.odds[0].spread}`;
}

export interface PointsEarnedAndAvailable {
  pointsEarned: number;
  pointsRemaining: number;
}

interface PickGame extends DBSportLeagueGame {
  userPick: DBPicksLeaguePick | null;
}

interface PickData {
  games: PickGame[];
}

export function getPointsEarnedAndRemainingFromUserPickData(
  picksData: PickData,
): PointsEarnedAndAvailable {
  let pointsEarned = 0;
  picksData?.games.forEach((game) => {
    const gamePickStatus = getGamePickStatus(game, game.userPick);
    switch (gamePickStatus) {
      case PicksLeaguePickStatuses.WIN:
        pointsEarned++;
        break;
      case PicksLeaguePickStatuses.PUSH:
        pointsEarned += 0.5;
        break;
      default:
    }
  });
  const availablePoints =
    picksData?.games.filter(
      (game) => game.status !== SportLeagueGameStatuses.FINAL,
    ).length ?? 0;

  return {
    pointsEarned,
    pointsRemaining: availablePoints,
  };
}
export function getGamePickTimeDisplay(
  game: DBSportLeagueGame,
  timezone: string,
) {
  let display = "";
  if (game.status === SportLeagueGameStatuses.FINAL) {
    display = "Final";
  } else if (game.period > 0) {
    switch (game.period) {
      case 1:
        display = `${game.clock} ${game.period}st`;
        break;
      case 2:
        display = `${game.clock} ${game.period}nd`;
        break;
      case 3:
        display = `${game.clock} ${game.period}rd`;
        break;
      case 4:
        display = `${game.clock} ${game.period}th`;
        break;
      case 5:
        display = `${game.clock} OT`;
        break;
      default:
        display = `${game.clock} Unknown`;
    }
  } else {
    display = formatDateTime(game.startTime, timezone);
  }

  return display;
}

import { SportLeagueGameStatuses } from "@/models/sportLeagueGames";
import { DbWeeklyPickGameData } from "@/db/sportLeagueWeeks";
import { DBSportLeagueGame } from "@/db/sportLeagueGames";
import { DBPicksLeaguePick } from "@/db/picksLeaguesPicks";

export enum GamePickStatuses {
  WIN = "Win",
  PUSH = "Push",
  LOSS = "Loss",
  PICKED = "Picked",
  UNPICKED = "Unpicked",
}

export function getGamePickStatus(
  game: DBSportLeagueGame,
  pick: DBPicksLeaguePick | null,
): GamePickStatuses {
  if (!pick) {
    return GamePickStatuses.UNPICKED;
  }

  if (pick.status !== GamePickStatuses.PICKED) {
    // status was already calculated via standings calculator
    return pick.status as GamePickStatuses;
  }

  if (game.status !== SportLeagueGameStatuses.FINAL) {
    return GamePickStatuses.PICKED;
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
    return GamePickStatuses.WIN;
  } else if (pointDifferential - spreadAdjustment === 0) {
    return GamePickStatuses.PUSH;
  } else {
    return GamePickStatuses.LOSS;
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

export function getGamePickTimeDisplay(game: DBSportLeagueGame): string {
  if (game.status === SportLeagueGameStatuses.FINAL) {
    return "Final";
  } else if (game.period > 0) {
    switch (game.period) {
      case 1:
        return `${game.clock} ${game.period}st`;
      case 2:
        return `${game.clock} ${game.period}nd`;
      case 3:
        return `${game.clock} ${game.period}rd`;
      case 4:
        return `${game.clock} ${game.period}th`;
      case 5:
        return `${game.clock} OT`;
      default:
        return `${game.clock} Unknown`;
    }
  } else {
    return `${game.startTime.toLocaleDateString()} ${game.startTime.toLocaleTimeString()}`;
  }
}

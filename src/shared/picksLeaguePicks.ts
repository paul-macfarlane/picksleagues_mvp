import { SportLeagueGameStatuses } from "@/models/sportLeagueGames";
import { DbWeeklyPickGameData } from "@/db/sportLeagueWeeks";

export enum GamePickStatuses {
  WIN = "Win",
  PUSH = "Push",
  LOSS = "Loss",
  TBD = "TBD",
}

export function getGamePickStatus(
  game: DbWeeklyPickGameData,
): GamePickStatuses {
  if (!game.userPick || game.status !== SportLeagueGameStatuses.FINAL) {
    return GamePickStatuses.TBD;
  }

  const pointDifferential =
    game.homeTeamId === game.userPick.teamId
      ? game.homeTeamScore - game.awayTeamScore
      : game.awayTeamScore - game.homeTeamScore;
  const spreadAdjustment = game.userPick.spread
    ? game.userPick.favorite
      ? game.userPick.spread!
      : game.userPick.spread! * -1
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
  if (game.userPick) {
    sign = game.userPick.favorite ? "-" : "+";
  } else if (homeAway === "HOME") {
    sign = game.odds[0].favoriteTeamId === game.homeTeamId ? "-" : "+";
  } else {
    sign = game.odds[0].favoriteTeamId === game.awayTeamId ? "-" : "+";
  }

  return `${sign}${game.odds[0].spread}`;
}

export function getGamePickTimeDisplay(game: DbWeeklyPickGameData): string {
  if (game.status === SportLeagueGameStatuses.FINAL) {
    // todo make enum out of this
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

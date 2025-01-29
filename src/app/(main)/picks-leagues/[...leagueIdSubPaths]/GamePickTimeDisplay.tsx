"use client";

import { DBSportLeagueGame } from "@/db/sportLeagueGames";
import { SportLeagueGameStatuses } from "@/models/sportLeagueGames";
import { DateTime } from "luxon";

export function GamePickTimeDisplay({ game }: { game: DBSportLeagueGame }) {
  let display = "";
  if (game.status === SportLeagueGameStatuses.FINAL) {
    return "Final";
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
    const date = DateTime.fromMillis(game.startTime.getTime());
    display = date.toFormat("MM/dd/yy h:mm a");
  }

  return <>{display}</>;
}

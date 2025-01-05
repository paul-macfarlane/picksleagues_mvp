import { sportGameOdds, sportGames, sportWeeks } from "@/db/schema";
import { and, eq, gt, lte } from "drizzle-orm";
import { db } from "@/db/client";
import { Transaction } from "@/db/util";

interface DBSportWeek {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date;
  seasonId: string;
  espnNumber: number | null;
  espnEventsRef: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function getCurrentDBSportWeeks(
  tx?: Transaction,
): Promise<DBSportWeek[]> {
  const now = new Date();
  let queryRows = [];
  if (tx) {
    queryRows = await tx
      .select()
      .from(sportWeeks)
      .where(and(lte(sportWeeks.startTime, now), gt(sportWeeks.endTime, now)));
    return queryRows;
  } else {
    queryRows = await db
      .select()
      .from(sportWeeks)
      .where(and(lte(sportWeeks.startTime, now), gt(sportWeeks.endTime, now)));
    return queryRows;
  }
}

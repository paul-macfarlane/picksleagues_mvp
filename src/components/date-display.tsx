"use client";

import { DateTime } from "luxon";

export function DateDisplay({ timestampMS }: { timestampMS: number }) {
  const date = DateTime.fromMillis(timestampMS);
  const formattedDate = date.toFormat("MM/dd/yy h:mm a");

  return <>{formattedDate}</>;
}

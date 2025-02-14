import { clsx, type ClassValue } from "clsx";
import { DateTime } from "luxon";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isUrl(url: string): boolean {
  try {
    new URL(url);
  } catch (e) {
    return false;
  }

  return true;
}

export function formatDateTime(date: Date, timezone: string): string {
  const dateTime = DateTime.fromISO(date.toISOString(), { zone: timezone });
  const formattedDateTime = dateTime.toFormat("MM/dd/yy h:mm a");
  return formattedDateTime;
}

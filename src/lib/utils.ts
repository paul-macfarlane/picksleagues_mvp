import { clsx, type ClassValue } from "clsx";
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

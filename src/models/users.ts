import { z } from "zod";
import { IMG_URL_MAX_LENGTH } from "./db";

export const MIN_USERNAME_LENGTH = 8;
export const MAX_USERNAME_LENGTH = 20;
export const MAX_FIRST_NAME_LENGTH = 64;
export const MAX_LAST_NAME_LENGTH = 64;

export const UpdateProfileFormSchema = z.object({
  username: z
    .string()
    .trim()
    .min(
      MIN_USERNAME_LENGTH,
      `Must be at least ${MIN_USERNAME_LENGTH} characters.`,
    )
    .max(
      MAX_USERNAME_LENGTH,
      `Cannot be more than ${MAX_USERNAME_LENGTH} characters.`,
    ),
  firstName: z
    .string()
    .trim()
    .min(1, `Required.`)
    .max(
      MAX_FIRST_NAME_LENGTH,
      `Cannot be more than ${MAX_FIRST_NAME_LENGTH} characters.`,
    ),
  lastName: z
    .string()
    .min(1, `Required.`)
    .max(
      MAX_LAST_NAME_LENGTH,
      `Cannot be more than ${MAX_LAST_NAME_LENGTH} characters.`,
    ),
  timezone: z.string().min(1, "Required.").refine(isValidIANATimezone, {
    message: "Invalid timezone.",
  }),
  imageUrl: z.union([
    z.string().url("Must be a valid url.").max(IMG_URL_MAX_LENGTH),
    z.string().length(0), // annoying, but because you can't have a controlled input with the value undefined in react-hook-form, we have to allow this to be an empty string
  ]),
});

function isValidIANATimezone(timezone: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
    return true;
  } catch (e) {
    return false;
  }
}

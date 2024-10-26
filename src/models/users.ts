import { z } from "zod";

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
  imageUrl: z.string().trim().url("Must be a valid url.").optional(),
});

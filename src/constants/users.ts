import { z } from "zod";

export const MIN_USERNAME_LENGTH = 8;
export const MAX_USERNAME_LENGTH = 20;
export const MAX_FIRST_NAME_LENGTH = 64;
export const MAX_LAST_NAME_LENGTH = 64;

// todo move this somewhere else
export const ProfileSetupFormSchema = z.object({
  username: z
    .string()
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
      `Cannot be more than ${MAX_LAST_NAME_LENGTH} characters`,
    ),
});

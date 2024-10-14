import {
  MAX_FIRST_NAME_LENGTH,
  MAX_LAST_NAME_LENGTH,
  MAX_USERNAME_LENGTH,
  MIN_USERNAME_LENGTH,
} from "@/constants/users";
import { z } from "zod";

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

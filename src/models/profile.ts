import {
  MAX_FIRST_NAME_LENGTH,
  MAX_LAST_NAME_LENGTH,
  MAX_USERNAME_LENGTH,
  MIN_USERNAME_LENGTH,
} from "@/constants/users";
import { z } from "zod";

const profileUsernameSchema = z
  .string()
  .trim()
  .min(
    MIN_USERNAME_LENGTH,
    `Must be at least ${MIN_USERNAME_LENGTH} characters.`,
  )
  .max(
    MAX_USERNAME_LENGTH,
    `Cannot be more than ${MAX_USERNAME_LENGTH} characters.`,
  );

const profileFirstNameSchema = z
  .string()
  .trim()
  .min(1, `Required.`)
  .max(
    MAX_FIRST_NAME_LENGTH,
    `Cannot be more than ${MAX_FIRST_NAME_LENGTH} characters.`,
  );

const profileLastNameSchema = z
  .string()
  .min(1, `Required.`)
  .max(
    MAX_LAST_NAME_LENGTH,
    `Cannot be more than ${MAX_LAST_NAME_LENGTH} characters`,
  );

const profileImageUrlSchema = z
  .string()
  .trim()
  .url("Must be a valid url.")
  .optional();

export const UpdateProfileFormSchema = z.object({
  username: profileUsernameSchema,
  firstName: profileFirstNameSchema,
  lastName: profileLastNameSchema,
  imageUrl: profileImageUrlSchema,
});

import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Google from "next-auth/providers/google";
import Discord from "next-auth/providers/discord";
import { db } from "./db/client";
import { accounts, sessions, users } from "./db/schema";

const allowDangerousEmailAccountLinking =
  process.env.NEXT_PUBLIC_ALLOW_DANGEROUS_EMAIL_ACCOUNT_LINKING === "true";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
  }),
  providers: [
    Discord({ allowDangerousEmailAccountLinking }),
    Google({ allowDangerousEmailAccountLinking }),
  ],
});

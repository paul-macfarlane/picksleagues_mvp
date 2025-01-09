import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import "@/config/env";

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN!,
});

// Separate db client for scripts because script need to read from env using a Node.js API, but app doesn't support retrieval from the same env in edge runtime
export const scriptDB = drizzle(client);

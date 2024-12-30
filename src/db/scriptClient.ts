import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import "@/config/env";

// see https://github.com/tursodatabase/libsql-client-ts/issues/225
function noCacheFetch(
  input: string | URL | globalThis.Request,
  init?: RequestInit,
): Promise<Response> {
  return fetch(input, { ...init, cache: "no-store" });
}

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN!,
  fetch: noCacheFetch,
});

// Separate db client for scripts because script need to read from env using a Node.js API, but app doesn't support retrieval from the same env in edge runtime
export const scriptDB = drizzle(client);

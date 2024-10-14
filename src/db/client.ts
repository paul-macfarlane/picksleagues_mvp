import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

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

export const db = drizzle(client);

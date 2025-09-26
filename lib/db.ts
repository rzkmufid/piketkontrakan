import { createClient, type Client } from "@libsql/client";

let client: Client | null = null;

export function getDb() {
  if (!client) {
    const raw = process.env.TORSO_DATABASE_URL;
    if (!raw) {
      throw new Error(
        "Missing TORSO_DATABASE_URL for libsql/Turso. Set it in Project Settings → Environment Variables."
      );
    }

    // Guard against Postgres/Neon URLs or unsupported params like sslmode
    if (raw.includes("sslmode")) {
      throw new Error(
        'Unsupported URL query parameter "sslmode". Use your Turso/libSQL URL (e.g. libsql://<db>-<org>.turso.io) without sslmode.'
      );
    }
    if (!raw.startsWith("libsql://") && !raw.startsWith("https://")) {
      throw new Error(
        "TORSO_DATABASE_URL must be a Turso/libSQL URL starting with libsql:// or https:// (not a postgres:// URL)."
      );
    }

    client = createClient({
      url: raw,
      authToken: process.env.TORSO_AUTH_TOKEN, // required on Turso
    });
  }
  return client;
}

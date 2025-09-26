// Run order: 001_init.sql -> 002_seed.sql
// Uses process.env.DATABASE_URL and DATABASE_AUTH_TOKEN

import { createClient } from "@libsql/client"
import fs from "node:fs"
import path from "node:path"

function readSql(relativePath: string): string {
  const full = path.join(process.cwd(), relativePath)
  return fs.readFileSync(full, "utf8")
}

// Very simple splitter: removes -- comments and splits by ';'
function splitStatements(sql: string): string[] {
  const lines = sql.split("\n").map((l) => (l.trim().startsWith("--") ? "" : l))
  const cleaned = lines.join("\n")
  return cleaned
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

async function runSqlFile(client: ReturnType<typeof createClient>, relativePath: string) {
  console.log(`[v0] Executing ${relativePath} ...`)
  const sql = readSql(relativePath)
  const statements = splitStatements(sql)
  for (const stmt of statements) {
    await client.execute(stmt)
  }
  console.log(`[v0] Done ${relativePath}`)
}

async function main() {
  const url = process.env.DATABASE_URL
  const token = process.env.DATABASE_AUTH_TOKEN

  if (!url) {
    throw new Error("DATABASE_URL is required. Set it in Project Settings → Environment Variables (Turso URL).")
  }
  if (url.includes("sslmode")) {
    throw new Error('Remove "sslmode" from DATABASE_URL. Turso/libSQL does not support that param.')
  }
  if (!url.startsWith("libsql://") && !url.startsWith("https://")) {
    throw new Error("DATABASE_URL must start with libsql:// or https:// (Turso/libSQL).")
  }

  const client = createClient({ url, authToken: token })

  // Run migrations and seed
  await runSqlFile(client, "scripts/sql/001_init.sql")
  await runSqlFile(client, "scripts/sql/002_seed.sql")

  console.log("[v0] Migrations complete.")
}

main().catch((err) => {
  console.error("[v0] Migration failed:", err?.message || err)
  process.exit(1)
})

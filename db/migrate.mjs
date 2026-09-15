#!/usr/bin/env node
/**
 * Apply db/schema.sql to DATABASE_URL.
 *
 * The schema is idempotent, so this is safe to run against an existing
 * database and is the only setup step a fresh deployment needs.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("missing DATABASE_URL");
  process.exit(2);
}

const here = dirname(fileURLToPath(import.meta.url));
const schema = readFileSync(join(here, "schema.sql"), "utf8");

const sql = postgres(url, { max: 1, prepare: false });
try {
  await sql.unsafe(schema);
  const [t] = await sql`select count(*)::int as n from public.news_articles`;
  console.log(`schema applied. news_articles currently holds ${t.n} row(s).`);
} catch (error) {
  console.error("schema failed:", error.message);
  process.exit(1);
} finally {
  await sql.end({ timeout: 2 });
}

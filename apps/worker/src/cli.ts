#!/usr/bin/env node
/**
 * Run one ingestion pass and print what happened.
 *
 * The scheduled path is `/api/cron/ingest`; this is the same work, locally:
 *
 *   npm run ingest
 */
import { runIngestion } from "./index.js";

try {
  const result = await runIngestion();
  const saved = result.beats - result.calls;
  console.log(
    `\n${result.beats} topics · ${result.calls} provider calls · ${result.inserted} new articles` +
      (saved > 0 ? `  (${saved} calls saved by batching)` : "") +
      "\n",
  );
  for (const r of result.results) {
    const detail = r.error ? `ERROR ${r.error}` : `${r.fetched} fetched, ${r.inserted} stored`;
    console.log(`  ${r.label.padEnd(14)} ${detail}`);
  }
  process.exit(result.results.some((r) => r.error) ? 1 : 0);
} catch (error) {
  console.error("\ningestion failed:", (error as Error).message, "\n");
  process.exit(1);
}

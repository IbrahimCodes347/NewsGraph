import assert from "node:assert/strict";
import { test } from "node:test";
import { BeatSchema, SEED_BEATS, BEAT_ID_PATTERN } from "./index.js";

test("the catalog is warm and well-formed", () => {
  assert.ok(SEED_BEATS.length >= 100, "expected the full catalog");
  for (const beat of SEED_BEATS) {
    assert.equal(beat.state, "warm");
    assert.match(beat.beat_id, BEAT_ID_PATTERN);
  }
});

test("every beat parses, with unique ids and unique tickers", () => {
  const ids = new Set<string>();
  const tickers = new Set<string>();
  for (const beat of SEED_BEATS) {
    assert.deepEqual(BeatSchema.parse(beat), beat);
    assert.ok(!ids.has(beat.beat_id), `duplicate beat id ${beat.beat_id}`);
    assert.ok(!tickers.has(beat.ticker), `duplicate ticker ${beat.ticker}`);
    ids.add(beat.beat_id);
    tickers.add(beat.ticker);
  }
});

test("every beat is English-only", () => {
  for (const beat of SEED_BEATS) {
    assert.deepEqual(beat.languages, ["eng"], `${beat.ticker} is not English-only`);
  }
});

test("no keyword is a bare short ticker", () => {
  // The failure this guards against is real and expensive: "S" (SentinelOne)
  // matches any headline containing the letter, "NOW" (ServiceNow) matches the
  // word "now", "OP" (Optimism) matches "Op-Ed". Every keyword has to be
  // distinctive enough to mean the asset and nothing else.
  const banned = new Set(["S", "F", "W", "OP", "OM", "NOW", "NOT", "CORE", "TRU", "DK", "GM", "MU", "TER", "FIL", "GRT"]);
  // Two deliberate exceptions, each paired with a distinctive name so the
  // generic word alone is never the only way a story can match.
  const excepted = new Map([["NOT", "Notcoin"], ["CORE", "Core"]]);
  for (const beat of SEED_BEATS) {
    for (const keyword of beat.keywords) {
      const upper = keyword.toUpperCase();
      if (banned.has(upper) && excepted.get(upper) !== beat.label) {
        assert.fail(`${beat.ticker}: keyword "${keyword}" is too generic to match on`);
      }
      if (banned.has(upper)) {
        assert.ok(beat.keywords.length > 1, `${beat.ticker}: a generic keyword needs a distinctive partner`);
      }
      assert.ok(keyword.trim().length >= 3, `${beat.ticker}: keyword "${keyword}" is too short`);
    }
  }
});

test("beat ids are stable for the tickers already in use", () => {
  const nvidia = SEED_BEATS.find((b) => b.ticker === "NVDA");
  assert.ok(nvidia, "expected NVDA in the catalog");
  assert.equal(nvidia?.beat_id, "b_bb964843350e", "NVDA keeps its original id so stored cursors survive");
});

test("the catalog is equity-only, for now", () => {
  const tickers = new Set(SEED_BEATS.map((b) => b.ticker));
  for (const t of ["NVDA", "TSM", "TSLA", "AAPL", "MSFT"]) {
    assert.ok(tickers.has(t), `expected ${t}`);
  }
  // Crypto was removed on purpose; this fails if it is quietly reintroduced
  // without the docs and the ingestion window being reconsidered.
  for (const t of ["BTC", "ETH", "SOL", "DOGE"]) {
    assert.ok(!tickers.has(t), `${t} is crypto — the catalog is equity-only`);
  }
});

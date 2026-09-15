import assert from "node:assert/strict";
import { test } from "node:test";
import { BeatSchema, SEED_BEATS, BEAT_ID_PATTERN } from "./index.js";

test("the catalog is warm and well-formed", () => {
  assert.ok(SEED_BEATS.length >= 4, "expected at least four topics");
  for (const beat of SEED_BEATS) {
    assert.equal(beat.state, "warm");
    assert.match(beat.beat_id, BEAT_ID_PATTERN);
  }
});

test("every seed beat parses against the canonical schema", () => {
  const ids = new Set<string>();
  for (const beat of SEED_BEATS) {
    const parsed = BeatSchema.parse(beat);
    assert.deepEqual(parsed, beat);
    assert.ok(!ids.has(beat.beat_id), `duplicate beat id ${beat.beat_id}`);
    ids.add(beat.beat_id);
  }
});

test("every seed concept URI is a newsapi.ai-style Wikipedia concept", () => {
  for (const beat of SEED_BEATS) {
    assert.ok(beat.concept_uris.length >= 1, beat.beat_id);
    for (const uri of beat.concept_uris) {
      assert.ok(
        uri.startsWith("http://en.wikipedia.org/wiki/"),
        `${beat.beat_id}: ${uri}`,
      );
    }
  }
});

test("NVIDIA keeps its original id, so stored articles still resolve", () => {
  // beat_id is the key clients store cursors against. Changing it for an
  // existing topic silently orphans every cursor already in the wild.
  const nvidia = SEED_BEATS.find((b) => b.beat_id === "b_bb964843350e");
  assert.ok(nvidia, "expected the legacy NVIDIA beat id to be preserved");
  assert.equal(nvidia?.label, "NVIDIA");
});

test("the topics an agent would actually poll are present", () => {
  const labels = SEED_BEATS.map((b) => b.label);
  for (const expected of ["NVIDIA", "Bitcoin", "Tesla", "Oil price"]) {
    assert.ok(labels.includes(expected), `expected topic ${expected}`);
  }
});

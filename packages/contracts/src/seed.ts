import type { Beat } from "./beats.js";

/**
 * The catalog.
 *
 * Four topics, chosen because they are things an agent would poll on a
 * schedule and act on — not because they are easy to fill. Adding a topic is a
 * pull request against this file; see docs/STATUS.md.
 *
 * `beat_id` is stable and must never be reused for a different subject: it is
 * the key clients store cursors against. NVIDIA keeps the id it has always had,
 * so existing stored articles still resolve to it.
 */
export const SEED_BEATS: readonly Beat[] = [
  {
    beat_id: "b_bb964843350e",
    label: "NVIDIA",
    concept_uris: ["http://en.wikipedia.org/wiki/Nvidia"],
    topic_filters: [],
    languages: ["eng"],
    excludes: "Product reviews and sponsored posts",
    state: "warm",
    refresh_interval_minutes: 15,
    freshness_slo_minutes: 30,
  },
  {
    beat_id: "b_7c4e91f0a2d3",
    label: "Bitcoin",
    concept_uris: ["http://en.wikipedia.org/wiki/Bitcoin"],
    topic_filters: [],
    languages: ["eng"],
    excludes: "Price predictions and giveaway spam",
    state: "warm",
    refresh_interval_minutes: 15,
    freshness_slo_minutes: 30,
  },
  {
    beat_id: "b_3f8a25c6e1b7",
    label: "Tesla",
    concept_uris: ["http://en.wikipedia.org/wiki/Tesla,_Inc."],
    topic_filters: [],
    languages: ["eng"],
    excludes: "Owner forums and delivery-day threads",
    state: "warm",
    refresh_interval_minutes: 15,
    freshness_slo_minutes: 30,
  },
  {
    beat_id: "b_9d1c6b40f8e2",
    label: "Oil price",
    concept_uris: ["http://en.wikipedia.org/wiki/Price_of_oil"],
    topic_filters: [],
    languages: ["eng"],
    excludes: "Retail fuel prices at the pump",
    state: "warm",
    refresh_interval_minutes: 15,
    freshness_slo_minutes: 30,
  },
];

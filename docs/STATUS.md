# Where the project is

Last verified: **2026-09-14** against production. Every number was read from the live system.

## What this is

An agent asks a topic and a cursor, and gets back either **"nothing moved"** or **a small pack of
cited stories**. Read-only. No credential, no billing.

## What exists

One API, one worker, one website. Nine packages became two.

| | |
| --- | --- |
| `apps/api` | `GET /v2/topics`, `/v2/news`, `/v2/changes`, `/v2/tools`, `/mcp`, `/health` |
| `apps/worker` | Ingestion: provider → English filter → dedupe → store |
| `packages/contracts` | Every wire shape as a zod schema — the single source of truth |
| `packages/db` | Typed read access over a Supabase client |
| `apps/web` | The site |
| `supabase/` | Migrations, and the generated Edge Functions |

`apps/api` is the canonical source for the deployed `news-api` function.
`scripts/sync-supabase.mjs` copies it there, and CI fails if the two drift.

## Verified working

- `/v2/topics` — **four topics**: NVIDIA, Bitcoin, Tesla, Oil price
- `/v2/news` — **133 articles** for NVIDIA, the one topic carried over from the previous catalog.
  The other three have none yet, so they report `unavailable` until the worker runs
- Articles stored under the retired topics (Federal Reserve 397, EU AI Act 2) remain in
  `news_articles` but are no longer reachable: no catalog entry points at them
- `/v2/changes` — signed, topic-bound cursors; a replay returns nothing rather than duplicates
- `/v2/tools` and `/mcp` — the same handlers, in OpenAI and MCP shape
- The site: landing, pricing, five docs pages, FAQ, dashboard, connect

The three pilot topics are `stale`, not healthy: they ingested once and have not been rescheduled.
**Nothing is scheduled** — `cron.job` is empty. That is the single biggest gap.

## Not built

- **Scheduled ingestion.** The worker runs, but nothing calls it on a timer.
- **`POST /v2/brief`** — a written summary rather than a list.
- **WebSocket push.** Clients poll; there is no subscribe.
- **Write access.** Everything is read-only.
- **Per-topic article counts** in `/v2/topics`, so a client cannot see where the data is without
  querying each topic.

## What to build next

Ordered by what unblocks the most. Each is scoped to one pull request.

1. **Schedule the worker.** Nothing refreshes, so the product is a snapshot. A cron calling the
   `news-worker` function is the highest-value change in this repository — and it is also what
   gives Bitcoin, Tesla and Oil price any articles at all.
2. **Add article counts to `/v2/topics`.** One join, and every client stops having to guess which
   topics are worth reading.
3. **Add topics.** Four is deliberately small. Adding one is the cheapest contribution available —
   there is an issue template for it, and it needs no code.
4. **Build `brief`.** The contract is the easy part; the interesting question is what a good
   three-sentence brief contains.
5. **A Python client.** `packages/sdk` was a thin TypeScript wrapper and has been removed. A Python
   one would be used immediately by more people than anything else here.
6. **Push instead of poll.** `changes` already has the cursor semantics WebSocket needs.

## Known issues

- `public.events` has RLS disabled — flagged by the Supabase advisor. It predates this model and
  may still have consumers; assess those before changing it.
- `apps/web/app/(site)/docs/` and the pricing page still describe an earlier, larger API. They are
  the next thing to rewrite.

## Verify any of this yourself

No credential, and the first three need no database.

```bash
git clone https://github.com/thepeternemec/NewsGraph.git
cd NewsGraph && npm install && npm run build:packages && npm test
```

```bash
NEWS=https://dnnoypytdfvsdenykooq.supabase.co/functions/v1/news-api
curl "$NEWS/v2/topics"                              # 4 topics
curl "$NEWS/v2/news?beat_id=b_bb964843350e"         # NVIDIA
```

If the site ever disagrees with these commands, **the site is wrong** — open an issue.

## How this stays true

**Never let the site or the docs claim more than the code does.** If you ship something, update
this file and the README in the same pull request.

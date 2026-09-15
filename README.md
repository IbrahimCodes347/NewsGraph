---
name: NewsGraph
type: api
category: real-time news context for AI agents
auth: none (read-only, public)
pricing: free while in early access
topics: 20
articles: 532
languages: eng
live: https://newsgraph.vercel.app
api: https://dnnoypytdfvsdenykooq.supabase.co/functions/v1/news-api
repo: https://github.com/thepeternemec/NewsGraph
license: MIT
---

# NewsGraph

<p align="center">
  <a href="https://github.com/thepeternemec/NewsGraph/stargazers"><img src="https://img.shields.io/github/stars/thepeternemec/NewsGraph?style=for-the-badge&logo=github&color=yellow" alt="Stars"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge" alt="MIT"></a>
  <a href="https://github.com/thepeternemec/NewsGraph/commits/main"><img src="https://img.shields.io/github/last-commit/thepeternemec/NewsGraph?style=flat-square" alt="Last commit"></a>
  <a href="https://github.com/thepeternemec/NewsGraph/issues"><img src="https://img.shields.io/github/issues/thepeternemec/NewsGraph?style=for-the-badge&color=orange" alt="Issues"></a>
</p>

**Real-time news context for AI agents.** An agent asks a topic and a cursor, and gets back either
**"nothing moved"** or **a small pack of cited stories**. Read-only, no credential, no billing.

Live at **[newsgraph.vercel.app](https://newsgraph.vercel.app)** · API at
`https://dnnoypytdfvsdenykooq.supabase.co/functions/v1/news-api`

> ### Start with [docs/STATUS.md](docs/STATUS.md)
>
> What works today with verified numbers, what is not built, and the six things worth building
> next. It is one page and it is the honest state of this repository.

---

## Quick start

```bash
git clone https://github.com/thepeternemec/NewsGraph.git
cd NewsGraph
npm install
npm run build:packages     # contracts and db must exist before the apps compile
npm test                   # no network, no database, no API key
npm run dev                # API on http://localhost:8787
```

Then, against production — nothing below needs a credential:

```bash
NEWS=https://dnnoypytdfvsdenykooq.supabase.co/functions/v1/news-api

curl "$NEWS/v2/topics"                            # the catalog, with per-topic status
curl "$NEWS/v2/news?beat_id=b_bb964843350e"       # articles for one topic
curl "$NEWS/v2/changes?beat_id=b_bb964843350e&cursor=<cursor>"
curl "$NEWS/v2/tools"                             # the same tools in OpenAI shape
```

---

## The canonical loop

```
1. GET  /v2/topics                          pick a beat_id (once)
2. GET  /v2/news?beat_id=…                  read the baseline, keep the cursor
3. later: GET /v2/changes?beat_id=…&cursor=…
4. if moved: summarise and cite the publisher URLs
5. store the new cursor
```

Step 3 is the product. It returns only what appeared since that cursor, and an empty page is a
**success** — it means nothing happened.

`docs/ARCHITECTURE.md` explains the design; `AGENTS.md` is the same loop written for a coding
agent to follow.

---

## Layout

```
apps/api          the API — topics, news, changes, tools, MCP
apps/worker       ingestion: provider → English filter → dedupe → store
apps/web          the site
packages/contracts  every wire shape as a zod schema
packages/db       typed read access
supabase/         migrations + the generated Edge Functions
```

Two packages and three apps, deliberately. `apps/api` is the canonical source for the deployed
`news-api` Edge Function — `scripts/sync-supabase.mjs` copies it and CI fails on drift, so the
Node service and the Deno function can never disagree.

---

## Rules that will come up in review

1. **Never claim more than the code does.** Every capability carries a status in STATUS.md and the
   README. Ship something, update those in the same PR.
2. **Wire shapes live in `packages/contracts`.** Change the schema, not just the handler.
3. **No article bodies, ever.** Items carry a title, an excerpt and a publisher URL. There is no
   `body` field at any price, and adding one is out of scope.
4. **Platform code is generated.** Edit `packages/` or `apps/`, then run `npm run sync:supabase`.

---

## Contributing

**[CONTRIBUTING-FIRST-PR.md](CONTRIBUTING-FIRST-PR.md)** — fresh clone to merged change.

The cheapest real contribution is a **topic**: seventeen of the twenty have no articles, and
[there is an issue template](https://github.com/thepeternemec/NewsGraph/issues/new?template=topic_request.yml)
that needs no code at all. After that, scheduling the worker (#1 in STATUS.md) is the single
highest-value change in the repository.

MIT licensed. No CLA. [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) has the ground rules.

---

## Docs

| Document | What it covers |
| --- | --- |
| **[docs/STATUS.md](docs/STATUS.md)** | **Where the project is, and what to build next** |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | How the pieces fit together |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Hosting, and what moving would cost |
| [AGENTS.md](AGENTS.md) | Integration guide for coding agents |
| [newsgraph.vercel.app/docs](https://newsgraph.vercel.app/docs) | The docs site |

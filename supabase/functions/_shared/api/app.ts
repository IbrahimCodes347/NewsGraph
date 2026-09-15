// GENERATED FILE — do not edit directly.
// Source of truth: packages/contracts + apps/{api,worker}/src.
// Regenerate with: npm run sync:supabase

/**
 * NewsGraph API.
 *
 * Read-only news interfaces: topics, articles, changes since a cursor, and an
 * MCP server for agent frameworks. This is the canonical source for the
 * deployed `news-api` Edge Function — `scripts/sync-supabase.mjs` copies it
 * there, so the Node service and the Deno function cannot drift.
 *
 * No credential is required. There is no billing here.
 */

import { Hono } from "npm:hono@^4.6.14";
import { newsRoutes } from "./news-routes.ts";
import { mcpResponse } from "./mcp.ts";

const app = new Hono();

app.use("*", async (c, next) => {
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  c.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, MCP-Protocol-Version, MCP-Session-Id",
  );
  if (c.req.method === "OPTIONS") return c.body(null, 204);
  await next();
});

app.get("/health", (c) => c.json({ ok: true, service: "newsgraph", version: "0.3.0" }));

app.get("/", (c) =>
  c.json({
    service: "NewsGraph",
    docs: "https://newsgraph.vercel.app/docs",
    repo: "https://github.com/thepeternemec/NewsGraph",
    routes: ["/v2/topics", "/v2/news", "/v2/changes", "/v2/tools", "/mcp", "/health"],
  }),
);

app.route("/v2", newsRoutes);
app.all("/mcp", (c) => mcpResponse(c.req.raw));

export default app;

"use client";

import { useEffect, useState } from "react";
import SignalField from "@/components/signal-field";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://dnnoypytdfvsdenykooq.supabase.co/functions/v1/news-api";

interface Topic {
  beat_id: string;
  label: string;
  status: string;
  last_success_at: string | null;
  last_checked_at: string | null;
}

interface Article {
  id: string;
  beat_id: string;
  title: string;
  excerpt: string;
  url: string;
  source: string;
  published_at: string;
  first_indexed_at: string;
}

type View = "signals" | "clusters";

const TABS: Array<{ value: View; title: string }> = [
  { value: "signals", title: "Signals" },
  { value: "clusters", title: "Article clusters" },
];

export default function Dashboard() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [view, setView] = useState<View>("signals");
  const [stamp, setStamp] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/v2/topics`, { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { topics?: Topic[] };
        const list = data.topics ?? [];
        setTopics(list);

        const funded = list.find((t) => t.status !== "unavailable");
        if (funded) {
          const news = await fetch(`${API_BASE}/v2/news?beat_id=${funded.beat_id}`, {
            cache: "no-store",
          });
          if (!cancelled && news.ok) {
            const page = (await news.json()) as { items?: Article[] };
            setArticles(page.items ?? []);
          }
        }
        setStamp(new Date().toLocaleTimeString());
      } catch {
        /* paused */
      }
    }
    load();
    const id = setInterval(load, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const live = topics.filter((t) => t.status !== "unavailable").length;
  const labelOf = new Map(topics.map((t) => [t.beat_id, t.label]));
  const counts: Record<View, number | undefined> = {
    signals: articles.length || undefined,
    clusters: topics.length || undefined,
  };

  return (
    <>
      <nav className="nav">
        <div className="nav-pill">
          <a className="nav-logo" href="/">
            NEWSGRAPH
          </a>
          <span className="nav-links">
            {TABS.map((t) => (
              <button
                key={t.value}
                type="button"
                className="nav-link"
                onClick={() => setView(t.value)}
                style={view === t.value ? { color: "#fff", background: "rgba(255,255,255,0.06)" } : undefined}
              >
                {t.title}
                <span style={{ marginLeft: 8, color: "var(--text-ghost)", fontFamily: "var(--font-mono)", fontSize: 10 }}>
                  {counts[t.value] ?? "…"}
                </span>
              </button>
            ))}
          </span>
          <a className="nav-cta" href="/">← Home</a>
        </div>
      </nav>

      <main className="wrap" style={{ paddingTop: 132, paddingBottom: 96 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, marginBottom: 28 }}>
          <div>
            <span className="sec-eyebrow">Live graph · English only · one cluster per beat</span>
            <h1 style={{ margin: 0, fontSize: "clamp(30px, 4vw, 44px)", lineHeight: 1.05, letterSpacing: "-0.035em", color: "#fff", fontWeight: 600 }}>
              {TABS.find((t) => t.value === view)?.title}
            </h1>
          </div>
          <span style={{ font: "11px var(--font-mono), monospace", color: "var(--text-ghost)" }}>
            {stamp ? `updated ${stamp}` : "connecting…"}
          </span>
        </div>

        <div className="metrics" style={{ borderTop: 0, paddingTop: 0 }}>
          <div className="metrics-grid">
            <div>
              <div className="metric-num">{topics.length || "…"}</div>
              <div className="metric-label">Topics in the catalog</div>
            </div>
            <div>
              <div className="metric-num">{articles.length || "…"}</div>
              <div className="metric-label">Articles in the live feed</div>
            </div>
            <div>
              <div className="metric-num">{live || "…"}</div>
              <div className="metric-label">Topics currently carrying articles</div>
            </div>
            <div>
              <div className="metric-num" style={{ fontFamily: "var(--font-mono)", fontSize: 22 }}>
                {stamp || "—"}
              </div>
              <div className="metric-label">Last ingest</div>
            </div>
          </div>
          <p className="hero-tiny" style={{ marginTop: 30 }}>
            read-only · no credential · topics, news and changes since a cursor
          </p>
        </div>

        {view === "signals" ? (
          <>
            <div className="mock" style={{ marginTop: 40 }}>
              <div className="mock-bar">
                <span className="mock-dots"><span /><span /><span /></span>
                <span className="mock-title">signal field</span>
                <span className="mock-live">streaming</span>
              </div>
              <SignalField
                items={articles.map((a) => ({
                  beat_label: labelOf.get(a.beat_id) ?? "—",
                  lede: a.title,
                  source: a.source,
                  url: a.url,
                }))}
              />
            </div>

            <div className="mock" style={{ marginTop: 24 }}>
              <div className="mock-bar">
                <span className="mock-dots"><span /><span /><span /></span>
                <span className="mock-title">latest pack items · has this moved?</span>
                <span className="mock-live">english</span>
              </div>
              <div className="mock-feed">
                {articles.slice(0, 24).map((it) => (
                  <a key={it.id} className="mock-row" href={it.url} target="_blank" rel="noreferrer">
                    <span className="k">{labelOf.get(it.beat_id) ?? "—"}</span>
                    <span className="v">{it.title}</span>
                    <span className="s">{it.source}</span>
                  </a>
                ))}
                {articles.length === 0 && (
                  <div className="mock-row">
                    <span className="k">awaiting</span>
                    <span className="v">Ingestion paused while the topic catalog is rebuilt for 100 beats.</span>
                    <span className="s">system</span>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="mock" style={{ marginTop: 40 }}>
            <div className="mock-bar">
              <span className="mock-dots"><span /><span /><span /></span>
              <span className="mock-title">article clusters · one per beat</span>
              <span className="mock-live">{topics.length} topics</span>
            </div>
            <div className="mock-feed">
              {topics.map((t) => (
                <div key={t.beat_id} className="mock-row">
                  <span className="k" title={t.beat_id}>{t.label}</span>
                  <span className="v">{t.status}</span>
                  <span className="s">
                    {t.last_success_at ? `latest ${t.last_success_at.slice(11, 16)}Z` : "—"}
                  </span>
                </div>
              ))}
              {topics.length === 0 && (
                <div className="mock-row">
                  <span className="k">awaiting</span>
                  <span className="v">No clusters yet — ingestion is paused.</span>
                  <span className="s">system</span>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="site">
        <div className="wrap">
          <div className="footer-row">
            <div className="footer-brand-line">
              <span className="footer-co">NEWSGRAPH</span>
              <span style={{ color: "var(--border-strong)" }}>/</span>
              <span className="footer-address">read-only · live graph</span>
            </div>
            <div className="footer-links">
              <a href="/">Home</a>
              <a href="/#contract">Contract</a>
              <a href="/#pricing">Pricing</a>
              <a href="/#faq">FAQ</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

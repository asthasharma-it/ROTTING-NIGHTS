"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { GENRES } from "@/lib/genres";
import { MOODS } from "@/lib/moods";
import { REGIONS } from "@/lib/regions";
import PosterGrid from "@/components/PosterGrid";
import { MediaSummary, WatchStatusType } from "@/types/media";

export default function SearchPage() {
  const { data: session } = useSession();
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState("");
  const [mood, setMood] = useState("");
  const [region, setRegion] = useState("");
  const [type, setType] = useState<"all" | "movie" | "tv">("all");
  const [results, setResults] = useState<MediaSummary[]>([]);
  const [statuses, setStatuses] = useState<Map<string, WatchStatusType>>(new Map());
  const [ratings, setRatings] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/status")
      .then((r) => r.json())
      .then((rows: { tmdbId: number; mediaType: string; status: WatchStatusType }[]) => {
        setStatuses(new Map(rows.map((r) => [`${r.mediaType}-${r.tmdbId}`, r.status])));
      });
    fetch("/api/rating")
      .then((r) => r.json())
      .then((rows: { tmdbId: number; mediaType: string; score: number }[]) => {
        setRatings(new Map(rows.map((r) => [`${r.mediaType}-${r.tmdbId}`, r.score])));
      });
  }, [session?.user]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setPage(1);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (genre) params.set("genre", genre);
    if (mood) params.set("mood", mood);
    if (region) params.set("region", region);
    if (type !== "all") params.set("type", type);
    params.set("page", "1");

    const t = setTimeout(
      () => {
        fetch(`/api/tmdb/search?${params.toString()}`, { signal: controller.signal })
          .then((r) => r.json())
          .then((data: MediaSummary[]) => {
            setResults(data);
            setHasMore(data.length > 0);
          })
          .catch(() => {})
          .finally(() => setLoading(false));
      },
      q ? 350 : 0
    );

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [q, genre, mood, region, type]);

  async function loadMore() {
    setLoadingMore(true);
    const nextPage = page + 1;
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (genre) params.set("genre", genre);
    if (mood) params.set("mood", mood);
    if (region) params.set("region", region);
    if (type !== "all") params.set("type", type);
    params.set("page", String(nextPage));

    const res = await fetch(`/api/tmdb/search?${params.toString()}`);
    const data: MediaSummary[] = await res.json();
    setResults((prev) => {
      const seen = new Set(prev.map((p) => `${p.mediaType}-${p.id}`));
      return [...prev, ...data.filter((d) => !seen.has(`${d.mediaType}-${d.id}`))];
    });
    setPage(nextPage);
    setHasMore(data.length > 0);
    setLoadingMore(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Search</h1>

      <div className="space-y-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search movies & series..."
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-accent"
        />
        <div className="flex flex-wrap gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "all" | "movie" | "tv")}
            className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm outline-none"
          >
            <option value="all">All types</option>
            <option value="movie">Movies</option>
            <option value="tv">Series</option>
          </select>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm outline-none"
          >
            <option value="">All genres</option>
            {GENRES.map((g) => (
              <option key={g.slug} value={g.slug}>
                {g.label}
              </option>
            ))}
          </select>
          <select
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm outline-none"
          >
            <option value="">Any mood</option>
            {MOODS.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.emoji} {m.label}
              </option>
            ))}
          </select>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm outline-none"
          >
            <option value="">Any language</option>
            {REGIONS.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-muted">Searching…</p>
      ) : (
        <>
          <PosterGrid
            items={results}
            statuses={statuses}
            ratings={ratings}
            emptyMessage="No matches yet — try a different search or filter."
          />
          {hasMore && results.length > 0 && (
            <div className="flex justify-center pt-2">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="rounded-full border border-border px-5 py-2 text-sm transition hover:border-accent hover:text-accent disabled:opacity-50"
              >
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

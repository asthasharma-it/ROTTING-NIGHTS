"use client";

import { useState } from "react";
import PosterGrid from "@/components/PosterGrid";
import { MediaSummary, WatchStatusType } from "@/types/media";

interface FetchParams {
  genre?: string;
  mood?: string;
  region?: string;
  type?: string;
}

interface Props {
  initialItems: MediaSummary[];
  initialStatuses: [string, WatchStatusType][];
  initialRatings: [string, number][];
  fetchParams: FetchParams;
  emptyMessage?: string;
}

export default function LoadMoreGrid({
  initialItems,
  initialStatuses,
  initialRatings,
  fetchParams,
  emptyMessage,
}: Props) {
  const [items, setItems] = useState(initialItems);
  const [statuses] = useState(() => new Map(initialStatuses));
  const [ratings] = useState(() => new Map(initialRatings));
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialItems.length > 0);

  async function loadMore() {
    setLoading(true);
    const nextPage = page + 1;
    const params = new URLSearchParams();
    if (fetchParams.genre) params.set("genre", fetchParams.genre);
    if (fetchParams.mood) params.set("mood", fetchParams.mood);
    if (fetchParams.region) params.set("region", fetchParams.region);
    if (fetchParams.type) params.set("type", fetchParams.type);
    params.set("page", String(nextPage));

    const res = await fetch(`/api/tmdb/search?${params.toString()}`);
    const data: MediaSummary[] = await res.json();

    setItems((prev) => {
      const seen = new Set(prev.map((p) => `${p.mediaType}-${p.id}`));
      return [...prev, ...data.filter((d) => !seen.has(`${d.mediaType}-${d.id}`))];
    });
    setPage(nextPage);
    setHasMore(data.length > 0);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <PosterGrid items={items} statuses={statuses} ratings={ratings} emptyMessage={emptyMessage} />
      {hasMore && items.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="rounded-full border border-border px-5 py-2 text-sm transition hover:border-accent hover:text-accent disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}

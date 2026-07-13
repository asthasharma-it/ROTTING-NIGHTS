"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MediaDetail, MediaSummary, WatchStatusType } from "@/types/media";
import StatusButtons from "@/components/StatusButtons";
import RatingStars from "@/components/RatingStars";

interface Props {
  initialItem: MediaDetail;
  pool: MediaSummary[];
  initialStatuses: [string, WatchStatusType][];
  initialRatings: [string, number][];
}

export default function FeaturedHero({
  initialItem,
  pool,
  initialStatuses,
  initialRatings,
}: Props) {
  const [item, setItem] = useState(initialItem);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMap] = useState(() => new Map(initialStatuses));
  const [ratingMap] = useState(() => new Map(initialRatings));

  const canShuffle = pool.some((p) => !(p.mediaType === item.mediaType && p.id === item.id));

  async function handleShuffle() {
    const candidates = pool.filter(
      (p) => !(p.mediaType === item.mediaType && p.id === item.id)
    );
    if (candidates.length === 0) return;
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    setLoading(true);
    setPlaying(false);
    try {
      const res = await fetch(`/api/tmdb/details?type=${pick.mediaType}&id=${pick.id}`);
      if (res.ok) {
        const data: MediaDetail = await res.json();
        setItem(data);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="relative aspect-video w-full">
        {playing && item.trailerKey ? (
          <iframe
            src={`https://www.youtube.com/embed/${item.trailerKey}?autoplay=1`}
            title={`${item.title} trailer`}
            className="absolute inset-0 h-full w-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : (
          <>
            {item.backdropUrl ? (
              <Image
                src={item.backdropUrl}
                alt={item.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 1024px"
                className={`object-cover transition-opacity duration-300 ${loading ? "opacity-40" : "opacity-100"}`}
              />
            ) : (
              <div className="absolute inset-0 bg-surface-2" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </>
        )}
      </div>

      {!playing && (
        <div className="absolute inset-x-0 bottom-0 space-y-3 p-5 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-wide text-accent">
              Featured for you
            </p>
            {canShuffle && (
              <button
                onClick={handleShuffle}
                disabled={loading}
                className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted backdrop-blur transition hover:border-accent hover:text-accent disabled:opacity-50"
              >
                {loading ? "Loading…" : "🔀 Try another"}
              </button>
            )}
          </div>
          <h2 className="text-2xl font-bold sm:text-4xl">{item.title}</h2>
          <p className="line-clamp-2 max-w-xl text-sm text-muted sm:text-base">
            {item.overview}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {item.trailerKey && (
              <button
                onClick={() => setPlaying(true)}
                className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
              >
                ▶ Play trailer
              </button>
            )}
            <Link
              href={`/title/${item.mediaType}/${item.id}`}
              className="rounded-full border border-border bg-background/60 px-5 py-2.5 text-sm font-medium backdrop-blur transition hover:border-accent hover:text-accent"
            >
              More info
            </Link>
            <StatusButtons
              key={`status-${item.mediaType}-${item.id}`}
              tmdbId={item.id}
              mediaType={item.mediaType}
              title={item.title}
              posterUrl={item.posterUrl}
              initialStatus={statusMap.get(`${item.mediaType}-${item.id}`) ?? null}
              size="sm"
            />
            <RatingStars
              key={`rating-${item.mediaType}-${item.id}`}
              tmdbId={item.id}
              mediaType={item.mediaType}
              initialScore={ratingMap.get(`${item.mediaType}-${item.id}`) ?? null}
              size="sm"
            />
          </div>
        </div>
      )}
    </section>
  );
}

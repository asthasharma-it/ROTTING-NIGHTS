"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MediaSummary, WatchStatusType } from "@/types/media";
import StatusButtons from "@/components/StatusButtons";
import RatingStars from "@/components/RatingStars";

interface Props {
  item: MediaSummary;
  initialStatus: WatchStatusType | null;
  initialRating: number | null;
}

export default function PosterOverlay({ item, initialStatus, initialRating }: Props) {
  const [revealed, setRevealed] = useState(false);

  function handleClick(e: React.MouseEvent) {
    if (!revealed) {
      e.preventDefault();
      setRevealed(true);
    }
  }

  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-border bg-surface"
      onMouseEnter={() => setRevealed(true)}
      onMouseLeave={() => setRevealed(false)}
    >
      <Link href={`/title/${item.mediaType}/${item.id}`} onClick={handleClick} className="block">
        <div className="relative aspect-2/3 w-full">
          {item.posterUrl ? (
            <Image
              src={item.posterUrl}
              alt={item.title}
              fill
              sizes="160px"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-2 text-center text-sm text-muted">
              {item.title}
            </div>
          )}
        </div>
      </Link>
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-1.5 bg-gradient-to-t from-black/90 via-black/70 to-transparent px-2 pb-2 pt-8 transition-opacity duration-200 ${
          revealed ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className={revealed ? "pointer-events-auto" : "pointer-events-none"}>
          <StatusButtons
            tmdbId={item.id}
            mediaType={item.mediaType}
            title={item.title}
            posterUrl={item.posterUrl}
            initialStatus={initialStatus}
            size="sm"
          />
        </div>
        <div className={revealed ? "pointer-events-auto" : "pointer-events-none"}>
          <RatingStars
            tmdbId={item.id}
            mediaType={item.mediaType}
            initialScore={initialRating}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}

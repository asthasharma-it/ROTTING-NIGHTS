"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MediaType } from "@/types/media";

interface Props {
  tmdbId: number;
  mediaType: MediaType;
  initialScore?: number | null;
  size?: "sm" | "lg";
}

export default function RatingStars({
  tmdbId,
  mediaType,
  initialScore = null,
  size = "lg",
}: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [score, setScore] = useState(initialScore ?? 0);
  const [hover, setHover] = useState(0);
  const [, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent, next: number) {
    e.preventDefault();
    e.stopPropagation();
    if (!session?.user) {
      router.push("/signin");
      return;
    }
    setScore(next);
    startTransition(async () => {
      await fetch("/api/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdbId, mediaType, score: next }),
      });
    });
  }

  const display = hover || score;

  return (
    <div
      className="flex items-center gap-1"
      onMouseLeave={() => setHover(0)}
      onClick={(e) => e.preventDefault()}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={(e) => handleClick(e, n)}
          onMouseEnter={() => setHover(n)}
          className={`leading-none transition ${size === "sm" ? "text-sm" : "text-2xl"}`}
          style={{ color: n <= display ? "var(--accent)" : "var(--border)" }}
          aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
      {size === "lg" && score > 0 && (
        <span className="ml-1 text-sm text-muted">{score}/5</span>
      )}
    </div>
  );
}

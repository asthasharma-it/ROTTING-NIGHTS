"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MediaType, WatchStatusType } from "@/types/media";
import { STATUS_META, STATUS_ORDER } from "@/lib/status";

interface Props {
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  posterUrl?: string | null;
  initialStatus?: WatchStatusType | null;
  size?: "sm" | "lg";
}

export default function StatusButtons({
  tmdbId,
  mediaType,
  title,
  posterUrl,
  initialStatus = null,
  size = "sm",
}: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [status, setStatus] = useState<WatchStatusType | null>(initialStatus);
  const [, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent, next: WatchStatusType) {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      router.push("/signin");
      return;
    }

    const clearing = status === next;
    setStatus(clearing ? null : next);

    startTransition(async () => {
      if (clearing) {
        await fetch(
          `/api/status?tmdbId=${tmdbId}&mediaType=${mediaType}`,
          { method: "DELETE" }
        );
      } else {
        await fetch("/api/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tmdbId,
            mediaType,
            status: next,
            title,
            posterPath: posterUrl,
          }),
        });
      }
    });
  }

  return (
    <div className={size === "lg" ? "flex flex-wrap gap-2" : "flex gap-1"}>
      {STATUS_ORDER.map((key) => {
        const meta = STATUS_META[key];
        const active = status === key;
        return (
          <button
            key={key}
            type="button"
            title={meta.label}
            onClick={(e) => handleClick(e, key)}
            className={
              size === "lg"
                ? "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition"
                : "flex h-7 w-7 items-center justify-center rounded-full border text-xs transition"
            }
            style={{
              borderColor: active ? meta.color : "var(--border)",
              backgroundColor: active ? `${meta.color}26` : "transparent",
              color: active ? meta.color : "var(--muted)",
            }}
          >
            <span>{meta.emoji}</span>
            {size === "lg" && <span>{meta.label}</span>}
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { MediaSummary } from "@/types/media";

export default function SurpriseMeButton({ pool }: { pool: MediaSummary[] }) {
  const router = useRouter();

  function handleClick() {
    if (pool.length === 0) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    router.push(`/title/${pick.mediaType}/${pick.id}`);
  }

  return (
    <button
      onClick={handleClick}
      disabled={pool.length === 0}
      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-4 text-base font-semibold text-background transition hover:opacity-90 disabled:opacity-40 sm:text-lg"
    >
      🎲 Pick something for me
    </button>
  );
}

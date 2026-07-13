"use client";

import { useState, useTransition } from "react";

interface Props {
  tmdbId: number;
  numberOfSeasons: number;
  initialSeason?: number | null;
  initialEpisode?: number | null;
}

export default function EpisodeTracker({
  tmdbId,
  numberOfSeasons,
  initialSeason,
  initialEpisode,
}: Props) {
  const [season, setSeason] = useState(initialSeason ?? 1);
  const [episode, setEpisode] = useState(initialEpisode ?? 1);
  const [saved, setSaved] = useState(false);
  const [, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdbId, season, episode }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    });
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <p className="text-sm font-medium">Your progress</p>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          Season
          <select
            value={season}
            onChange={(e) => setSeason(Number(e.target.value))}
            className="rounded-lg border border-border bg-surface-2 px-2 py-1 outline-none"
          >
            {Array.from({ length: numberOfSeasons }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          Episode
          <input
            type="number"
            min={1}
            value={episode}
            onChange={(e) => setEpisode(Number(e.target.value))}
            className="w-16 rounded-lg border border-border bg-surface-2 px-2 py-1 outline-none"
          />
        </label>
        <button
          onClick={save}
          className="rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-background transition hover:opacity-90"
        >
          {saved ? "Saved ✓" : "Save"}
        </button>
      </div>
    </div>
  );
}

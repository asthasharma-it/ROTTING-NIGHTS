import Link from "next/link";
import { MOODS } from "@/lib/moods";

export default function MoodPicker() {
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-medium text-muted">Or pick a mood</h2>
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {MOODS.map((m) => (
          <Link
            key={m.slug}
            href={`/mood/${m.slug}`}
            className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-sm transition hover:border-accent hover:bg-surface-2"
          >
            <span>{m.emoji}</span>
            <span>{m.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

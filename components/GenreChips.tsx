import Link from "next/link";
import { GENRES } from "@/lib/genres";

export default function GenreChips() {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Browse by genre</h2>
      <div className="flex flex-wrap gap-2">
        {GENRES.map((g) => (
          <Link
            key={g.slug}
            href={`/genre/${g.slug}`}
            className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm transition hover:border-accent hover:text-accent"
          >
            {g.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

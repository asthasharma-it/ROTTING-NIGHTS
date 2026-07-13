import Link from "next/link";
import { REGIONS } from "@/lib/regions";

export default function RegionChips() {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Browse by language & region</h2>
      <div className="flex flex-wrap gap-2">
        {REGIONS.map((r) => (
          <Link
            key={r.slug}
            href={`/region/${r.slug}`}
            className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm transition hover:border-accent hover:text-accent"
          >
            {r.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

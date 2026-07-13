import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDetails, withConcurrencyLimit } from "@/lib/tmdb";
import { getRatingMap } from "@/lib/user-data";
import PosterGrid from "@/components/PosterGrid";
import { STATUS_META, STATUS_ORDER } from "@/lib/status";
import { MediaSummary, WatchStatusType } from "@/types/media";

const TABS: (WatchStatusType | "ALL")[] = ["ALL", ...STATUS_ORDER];

export default async function MyListsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  const { tab } = await searchParams;
  const activeTab = (tab?.toUpperCase() as WatchStatusType | "ALL") ?? "ALL";

  if (!session?.user) {
    return (
      <div className="space-y-3 py-16 text-center">
        <p className="text-lg font-medium">Sign in to see your lists</p>
        <Link
          href="/signin"
          className="inline-block rounded-full bg-accent px-4 py-2 text-sm font-medium text-background"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const rows = await prisma.watchStatus.findMany({
    where: {
      userId: session.user.id,
      ...(activeTab !== "ALL" ? { status: activeTab } : {}),
    },
    orderBy: { updatedAt: "desc" },
  });

  const [details, ratings] = await Promise.all([
    withConcurrencyLimit(
      rows.map((r) => () => getDetails(r.mediaType, r.tmdbId)),
      4
    ),
    getRatingMap(),
  ]);

  const items: MediaSummary[] = rows.map((r, i) => ({
    id: r.tmdbId,
    mediaType: r.mediaType,
    title: r.title,
    posterUrl: r.posterPath ?? details[i]?.posterUrl ?? null,
    year: details[i]?.year ?? null,
    genreSlugs: details[i]?.genreSlugs ?? [],
  }));

  const statuses = new Map<string, WatchStatusType>(
    rows.map((r) => [`${r.mediaType}-${r.tmdbId}`, r.status])
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">My Lists</h1>
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const label = t === "ALL" ? "All" : STATUS_META[t].label;
          const emoji = t === "ALL" ? "🗂️" : STATUS_META[t].emoji;
          const active = activeTab === t;
          return (
            <Link
              key={t}
              href={t === "ALL" ? "/my-lists" : `/my-lists?tab=${t.toLowerCase()}`}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                active
                  ? "border-accent bg-accent-soft/40 text-accent"
                  : "border-border text-muted"
              }`}
            >
              {emoji} {label}
            </Link>
          );
        })}
      </div>
      <PosterGrid
        items={items}
        statuses={statuses}
        ratings={ratings}
        emptyMessage="Nothing tagged here yet — go mark something!"
      />
    </div>
  );
}

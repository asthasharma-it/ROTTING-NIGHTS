import { notFound } from "next/navigation";
import { getMoodBySlug } from "@/lib/moods";
import { getByMood } from "@/lib/tmdb";
import { getRatingMap, getStatusMap } from "@/lib/user-data";
import LoadMoreGrid from "@/components/LoadMoreGrid";

export default async function MoodPage({
  params,
}: {
  params: Promise<{ mood: string }>;
}) {
  const { mood: slug } = await params;
  const mood = getMoodBySlug(slug);
  if (!mood) notFound();

  const [items, statuses, ratings] = await Promise.all([
    getByMood(slug),
    getStatusMap(),
    getRatingMap(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        {mood.emoji} {mood.label}
      </h1>
      <LoadMoreGrid
        initialItems={items}
        initialStatuses={Array.from(statuses.entries())}
        initialRatings={Array.from(ratings.entries())}
        fetchParams={{ mood: slug }}
        emptyMessage="Nothing matching this mood yet."
      />
    </div>
  );
}

import { notFound } from "next/navigation";
import { getGenreBySlug } from "@/lib/genres";
import { getByGenre } from "@/lib/tmdb";
import { getRatingMap, getStatusMap } from "@/lib/user-data";
import LoadMoreGrid from "@/components/LoadMoreGrid";

export default async function GenrePage({
  params,
}: {
  params: Promise<{ genre: string }>;
}) {
  const { genre: slug } = await params;
  const genre = getGenreBySlug(slug);
  if (!genre) notFound();

  const [items, statuses, ratings] = await Promise.all([
    getByGenre(slug),
    getStatusMap(),
    getRatingMap(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{genre.label}</h1>
      <LoadMoreGrid
        initialItems={items}
        initialStatuses={Array.from(statuses.entries())}
        initialRatings={Array.from(ratings.entries())}
        fetchParams={{ genre: slug }}
        emptyMessage={`No ${genre.label} titles found yet.`}
      />
    </div>
  );
}

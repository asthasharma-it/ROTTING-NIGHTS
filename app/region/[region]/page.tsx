import { notFound } from "next/navigation";
import { getRegionBySlug } from "@/lib/regions";
import { getByRegion } from "@/lib/tmdb";
import { getRatingMap, getStatusMap } from "@/lib/user-data";
import LoadMoreGrid from "@/components/LoadMoreGrid";

export default async function RegionPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const { region: slug } = await params;
  const region = getRegionBySlug(slug);
  if (!region) notFound();

  const [items, statuses, ratings] = await Promise.all([
    getByRegion(slug),
    getStatusMap(),
    getRatingMap(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{region.label}</h1>
      <LoadMoreGrid
        initialItems={items}
        initialStatuses={Array.from(statuses.entries())}
        initialRatings={Array.from(ratings.entries())}
        fetchParams={{ region: slug }}
        emptyMessage={`No ${region.label} titles found yet.`}
      />
    </div>
  );
}

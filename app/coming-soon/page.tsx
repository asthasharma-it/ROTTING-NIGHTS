import { getUpcoming } from "@/lib/tmdb";
import { getRatingMap, getStatusMap } from "@/lib/user-data";
import PosterGrid from "@/components/PosterGrid";

export default async function ComingSoonPage() {
  const [items, statuses, ratings] = await Promise.all([
    getUpcoming(),
    getStatusMap(),
    getRatingMap(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Coming Soon</h1>
      <p className="text-muted">New and upcoming releases, kept fresh.</p>
      <PosterGrid
        items={items}
        statuses={statuses}
        ratings={ratings}
        emptyMessage="No upcoming releases found right now."
      />
    </div>
  );
}

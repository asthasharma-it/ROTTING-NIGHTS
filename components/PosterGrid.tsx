import { MediaSummary, WatchStatusType } from "@/types/media";
import PosterCard from "@/components/PosterCard";

interface Props {
  items: MediaSummary[];
  statuses?: Map<string, WatchStatusType>;
  ratings?: Map<string, number>;
  emptyMessage?: string;
}

export default function PosterGrid({ items, statuses, ratings, emptyMessage }: Props) {
  if (items.length === 0) {
    return <p className="text-muted">{emptyMessage ?? "Nothing here yet."}</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 md:grid-cols-4 lg:grid-cols-5">
      {items.map((item) => (
        <PosterCard
          key={`${item.mediaType}-${item.id}`}
          item={item}
          initialStatus={statuses?.get(`${item.mediaType}-${item.id}`) ?? null}
          initialRating={ratings?.get(`${item.mediaType}-${item.id}`) ?? null}
        />
      ))}
    </div>
  );
}

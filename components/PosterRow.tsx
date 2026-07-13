import { MediaSummary, WatchStatusType } from "@/types/media";
import PosterCard from "@/components/PosterCard";

interface Props {
  title: string;
  items: MediaSummary[];
  statuses?: Map<string, WatchStatusType>;
  ratings?: Map<string, number>;
}

export default function PosterRow({ title, items, statuses, ratings }: Props) {
  if (items.length === 0) return null;
  return (
    <section className="space-y-3">
      <h2 className="px-4 text-lg font-semibold sm:px-0">{title}</h2>
      <div className="no-scrollbar flex gap-4 overflow-x-auto px-4 pb-2 sm:px-0">
        {items.map((item) => (
          <PosterCard
            key={`${item.mediaType}-${item.id}`}
            item={item}
            initialStatus={statuses?.get(`${item.mediaType}-${item.id}`) ?? null}
            initialRating={ratings?.get(`${item.mediaType}-${item.id}`) ?? null}
          />
        ))}
      </div>
    </section>
  );
}

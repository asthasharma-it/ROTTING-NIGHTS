import Link from "next/link";
import { MediaSummary, WatchStatusType } from "@/types/media";
import PosterOverlay from "@/components/PosterOverlay";
import { genreLabel } from "@/lib/genres";

interface Props {
  item: MediaSummary;
  initialStatus?: WatchStatusType | null;
  initialRating?: number | null;
}

export default function PosterCard({ item, initialStatus = null, initialRating = null }: Props) {
  return (
    <div className="flex w-36 flex-shrink-0 flex-col gap-2 sm:w-40">
      <PosterOverlay item={item} initialStatus={initialStatus} initialRating={initialRating} />
      <div className="space-y-0.5">
        <Link
          href={`/title/${item.mediaType}/${item.id}`}
          className="line-clamp-1 text-sm font-medium hover:text-accent"
        >
          {item.title}
        </Link>
        <p className="text-xs text-muted">
          {item.year ?? ""}
          {item.genreSlugs[0] ? ` · ${genreLabel(item.genreSlugs[0])}` : ""}
        </p>
      </div>
    </div>
  );
}

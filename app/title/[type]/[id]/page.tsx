import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { fetchDetailsRaw, TmdbNotFoundError } from "@/lib/tmdb";
import { getItemUserData } from "@/lib/user-data";
import { genreLabel } from "@/lib/genres";
import StatusButtons from "@/components/StatusButtons";
import RatingStars from "@/components/RatingStars";
import StreamingLogos from "@/components/StreamingLogos";
import EpisodeTracker from "@/components/EpisodeTracker";
import { MediaDetail, MediaType } from "@/types/media";

export default async function TitleDetailPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;
  if (type !== "movie" && type !== "tv") notFound();
  const mediaType = type as MediaType;
  const tmdbId = Number(id);
  if (!Number.isFinite(tmdbId)) notFound();

  let detail: MediaDetail;
  try {
    detail = await fetchDetailsRaw(mediaType, tmdbId);
  } catch (err) {
    if (err instanceof TmdbNotFoundError) notFound();
    return (
      <div className="mx-auto max-w-md space-y-4 py-16 text-center">
        <p className="text-lg font-medium">Couldn&apos;t load this title right now</p>
        <p className="text-sm text-muted">
          Our connection to the movie database is having a hiccup. This usually clears up in a
          few seconds.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            href={`/title/${mediaType}/${tmdbId}`}
            className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-background"
          >
            Try again
          </Link>
          <Link
            href="/"
            className="rounded-full border border-border px-4 py-2 text-sm text-muted transition hover:border-accent hover:text-accent"
          >
            Back home
          </Link>
        </div>
      </div>
    );
  }

  const { status, rating, progress } = await getItemUserData(mediaType, tmdbId);

  const genreText = detail.genres.length
    ? detail.genres.join(", ")
    : detail.genreSlugs.map(genreLabel).join(", ");

  const metaParts = [
    detail.year,
    detail.runtimeMinutes ? `${detail.runtimeMinutes} min` : null,
    detail.numberOfSeasons
      ? `${detail.numberOfSeasons} season${detail.numberOfSeasons > 1 ? "s" : ""}`
      : null,
    genreText || null,
  ].filter(Boolean);

  return (
    <div className="grid gap-8 sm:grid-cols-[240px_1fr]">
      <div className="relative mx-auto aspect-2/3 w-48 overflow-hidden rounded-2xl border border-border bg-surface sm:mx-0 sm:w-full">
        {detail.posterUrl ? (
          <Image
            src={detail.posterUrl}
            alt={detail.title}
            fill
            sizes="240px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-4 text-center text-muted">
            {detail.title}
          </div>
        )}
      </div>

      <div className="space-y-5">
        <div>
          <h1 className="text-3xl font-semibold">{detail.title}</h1>
          <p className="mt-1 text-sm text-muted">{metaParts.join(" · ")}</p>
        </div>

        <p className="leading-relaxed text-foreground/90">
          {detail.overview || "No summary available yet."}
        </p>

        {detail.cast.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted">Cast</p>
            <p className="text-sm">{detail.cast.map((c) => c.name).join(", ")}</p>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted">Where to watch</p>
          <StreamingLogos providers={detail.providers} />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted">Mark it</p>
          <StatusButtons
            tmdbId={tmdbId}
            mediaType={mediaType}
            title={detail.title}
            posterUrl={detail.posterUrl}
            initialStatus={status}
            size="lg"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted">Your rating</p>
          <RatingStars tmdbId={tmdbId} mediaType={mediaType} initialScore={rating} />
        </div>

        {mediaType === "tv" && detail.numberOfSeasons ? (
          <EpisodeTracker
            tmdbId={tmdbId}
            numberOfSeasons={detail.numberOfSeasons}
            initialSeason={progress?.season}
            initialEpisode={progress?.episode}
          />
        ) : null}
      </div>
    </div>
  );
}

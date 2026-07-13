import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getByGenre,
  getDetails,
  getSimilar,
  getTrending,
  getUpcoming,
  withConcurrencyLimit,
} from "@/lib/tmdb";
import { getRatingMap, getStatusMap } from "@/lib/user-data";
import { buildGenreWeights, scoreAndSort } from "@/lib/recommend";
import PosterRow from "@/components/PosterRow";
import MoodPicker from "@/components/MoodPicker";
import SurpriseMeButton from "@/components/SurpriseMeButton";
import FeaturedHero from "@/components/FeaturedHero";
import { MediaSummary } from "@/types/media";

interface SimilarRow {
  title: string;
  items: MediaSummary[];
}

export default async function HomePage() {
  const session = await auth();

  // Cold start: a brand-new account has nothing to personalize from, so
  // Home would just be Trending wearing a "for you" label. Send them
  // straight to the quiz instead of letting them scroll past a skippable
  // banner — once they've completed it, or rated anything at all, this
  // never fires again.
  if (session?.user && !session.user.hasCompletedQuiz) {
    const ratingCount = await prisma.rating.count({ where: { userId: session.user.id } });
    if (ratingCount === 0) redirect("/onboarding");
  }

  const [trending, upcoming, statuses, ratingMap] = await Promise.all([
    getTrending(),
    getUpcoming(),
    getStatusMap(),
    getRatingMap(),
  ]);

  let recommended: MediaSummary[] = [];
  let continueWatching: MediaSummary[] = [];
  let similarRows: SimilarRow[] = [];

  if (session?.user) {
    const [quizAnswers, ratings, ongoingRows, topRated] = await Promise.all([
      prisma.quizAnswer.findMany({ where: { userId: session.user.id } }),
      prisma.rating.findMany({ where: { userId: session.user.id }, take: 25 }),
      prisma.watchStatus.findMany({
        where: { userId: session.user.id, status: "ONGOING" },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.rating.findMany({
        where: { userId: session.user.id, score: { gte: 4 } },
        orderBy: [{ score: "desc" }, { updatedAt: "desc" }],
        take: 2,
      }),
    ]);

    if (ongoingRows.length > 0) {
      const ongoingDetails = await withConcurrencyLimit(
        ongoingRows.map((r) => () => getDetails(r.mediaType, r.tmdbId)),
        4
      );
      continueWatching = ongoingRows.map((r, i) => ({
        id: r.tmdbId,
        mediaType: r.mediaType,
        title: r.title,
        posterUrl: r.posterPath ?? ongoingDetails[i]?.posterUrl ?? null,
        year: ongoingDetails[i]?.year ?? null,
        genreSlugs: ongoingDetails[i]?.genreSlugs ?? [],
      }));
    }

    // "Because you liked X": TMDB's own recommendation model (based on
    // actual viewing-behavior overlap) anchored on your highest-rated
    // titles, so these are explainable and not just genre-overlap guessing.
    if (topRated.length > 0) {
      const rows = await withConcurrencyLimit(
        topRated.map((r) => async () => {
          const [detail, similar] = await Promise.all([
            getDetails(r.mediaType, r.tmdbId),
            getSimilar(r.mediaType, r.tmdbId),
          ]);
          const items = similar.filter(
            (item) => !statuses.has(`${item.mediaType}-${item.id}`)
          );
          return { title: detail?.title ?? "this", items };
        }),
        2
      );
      similarRows = rows.filter((r) => r.items.length > 0);
    }

    if (quizAnswers.length > 0 || ratings.length > 0) {
      const ratedDetails = await withConcurrencyLimit(
        ratings.map((r) => () => getDetails(r.mediaType as "movie" | "tv", r.tmdbId)),
        4
      );
      const genresByRatedItem = new Map<string, string[]>();
      ratings.forEach((r, i) => {
        const detail = ratedDetails[i];
        if (detail) genresByRatedItem.set(`${r.mediaType}-${r.tmdbId}`, detail.genreSlugs);
      });

      const weights = buildGenreWeights(quizAnswers, ratings, genresByRatedItem);

      // Pull in a much bigger, more relevant candidate pool than just the
      // trending list: fetch the user's top-weighted genres directly so
      // recommendations draw from hundreds of titles, not ~20.
      const topGenres = Array.from(weights.entries())
        .filter(([, w]) => w > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([slug]) => slug);

      const genrePools = await withConcurrencyLimit(
        topGenres.map((slug) => () => getByGenre(slug, "all")),
        2
      );
      const candidatePool = [...trending, ...genrePools.flat()];
      const seen = new Set<string>();
      const uniqueCandidates = candidatePool.filter((item) => {
        const key = `${item.mediaType}-${item.id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        // Skip anything already tagged (any status) so recommendations
        // keep surfacing fresh titles instead of repeating what's already
        // on your list.
        if (statuses.has(key)) return false;
        return true;
      });

      recommended = scoreAndSort(uniqueCandidates, weights).slice(0, 24);
    }
  }

  // Keep both the hero and the "surprise me" pick anchored to your actual
  // top matches (not a wide/blended pool) so they feel deliberately chosen
  // for you rather than random. Trending is only a last resort for brand
  // new accounts with no taste signal yet.
  const similarPoolFlat = similarRows.flatMap((r) => r.items);
  const topPicks =
    recommended.length > 0
      ? recommended.slice(0, 8)
      : similarPoolFlat.length > 0
        ? similarPoolFlat.slice(0, 8)
        : trending.slice(0, 8);

  // Rotate among the top 3 rather than always showing the exact same #1
  // pick, so the hero feels fresh across visits without losing relevance.
  const heroCandidate =
    topPicks.length > 0
      ? topPicks[Math.floor(Math.random() * Math.min(3, topPicks.length))]
      : undefined;
  const heroDetail = heroCandidate
    ? await getDetails(heroCandidate.mediaType, heroCandidate.id)
    : null;

  return (
    <div className="space-y-10">
      <section className="space-y-2 py-4">
        <h1 className="text-2xl font-semibold sm:text-3xl">
          Hey, {session?.user?.name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="text-muted">Let&apos;s find something to watch.</p>
      </section>

      {heroDetail && (
        <FeaturedHero
          initialItem={heroDetail}
          pool={topPicks}
          initialStatuses={Array.from(statuses.entries())}
          initialRatings={Array.from(ratingMap.entries())}
        />
      )}

      <SurpriseMeButton pool={topPicks} />

      {continueWatching.length > 0 && (
        <PosterRow
          title="Continue Watching"
          items={continueWatching}
          statuses={statuses}
          ratings={ratingMap}
        />
      )}

      {recommended.length > 0 && (
        <PosterRow
          title="Recommended for you"
          items={recommended}
          statuses={statuses}
          ratings={ratingMap}
        />
      )}

      {similarRows.map((row) => (
        <PosterRow
          key={row.title}
          title={`Because you liked ${row.title}`}
          items={row.items}
          statuses={statuses}
          ratings={ratingMap}
        />
      ))}

      <MoodPicker />

      <PosterRow
        title="Trending this week"
        items={trending}
        statuses={statuses}
        ratings={ratingMap}
      />
      <PosterRow
        title="New & coming soon"
        items={upcoming.slice(0, 10)}
        statuses={statuses}
        ratings={ratingMap}
      />
    </div>
  );
}

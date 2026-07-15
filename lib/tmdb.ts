import { MediaDetail, MediaSummary, MediaType, Provider } from "@/types/media";
import { GENRES, getGenreBySlug, tmdbGenreIdsToSlugs } from "@/lib/genres";
import { getMoodBySlug } from "@/lib/moods";
import { getRegionBySlug } from "@/lib/regions";
import { getMockById, getMockCatalog } from "@/lib/mock-data";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const LOGO_BASE = "https://image.tmdb.org/t/p/w92";
const BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";
const REGION = "IN";

export function hasTmdbKey(): boolean {
  return Boolean(process.env.TMDB_API_KEY);
}

// Thrown when TMDB itself says a resource doesn't exist. Distinct from a
// network-level failure so callers can tell "genuinely not found" apart from
// "our connection to TMDB is having a bad moment" instead of treating both
// as the same dead end.
export class TmdbNotFoundError extends Error {
  constructor(url: string) {
    super(`TMDB 404 on ${url}`);
    this.name = "TmdbNotFoundError";
  }
}

async function tmdbFetchOnce(url: string) {
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (res.status === 404) throw new TmdbNotFoundError(url);
  if (!res.ok) throw new Error(`TMDB error ${res.status} on ${url}`);
  return res.json();
}

// TMDB connections occasionally time out transiently, and this environment
// has been observed to have multi-second bad windows (several consecutive
// connection failures), not just single blips — so a single-item lookup
// (title detail page, "Pick something for me") gets several attempts spread
// over a few seconds before giving up. A genuine 404 skips retries entirely
// since trying again can't fix a title that doesn't exist.
async function tmdbFetch(path: string, params: Record<string, string> = {}) {
  const url = new URL(TMDB_BASE + path);
  url.searchParams.set("api_key", process.env.TMDB_API_KEY as string);
  url.searchParams.set("language", "en-US");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const delays = [0, 300, 800, 1500];
  let lastError: unknown;
  for (const delay of delays) {
    if (delay) await new Promise((r) => setTimeout(r, delay));
    try {
      return await tmdbFetchOnce(url.toString());
    } catch (err) {
      if (err instanceof TmdbNotFoundError) throw err;
      lastError = err;
    }
  }
  throw lastError;
}

// Runs async tasks with at most `limit` in flight at once, to avoid bursts
// of simultaneous connections to the same host.
export async function withConcurrencyLimit<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let next = 0;
  async function worker() {
    while (next < tasks.length) {
      const i = next++;
      results[i] = await tasks[i]();
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}

interface RawResult {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string | null;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  media_type?: string;
}

// TMDB's "trending" is based on page views/searches on TMDB itself, not
// actual watch activity — a hyped unreleased title can easily out-rank
// things people can actually watch right now. Anything with a future
// release/air date doesn't belong in "Trending this week"; it belongs in
// Coming Soon instead.
function isReleased(raw: RawResult, mediaType: MediaType): boolean {
  const dateStr = mediaType === "movie" ? raw.release_date : raw.first_air_date;
  if (!dateStr) return true;
  return dateStr <= new Date().toISOString().slice(0, 10);
}

function toSummary(raw: RawResult, mediaType: MediaType): MediaSummary {
  const title = (mediaType === "movie" ? raw.title : raw.name) ?? "Untitled";
  const dateStr = mediaType === "movie" ? raw.release_date : raw.first_air_date;
  const genreIds = raw.genre_ids ?? raw.genres?.map((g) => g.id) ?? [];
  return {
    id: raw.id,
    mediaType,
    title,
    posterUrl: raw.poster_path ? `${IMAGE_BASE}${raw.poster_path}` : null,
    year: dateStr ? dateStr.slice(0, 4) : null,
    genreSlugs: tmdbGenreIdsToSlugs(genreIds),
  };
}

function dedupeById(items: MediaSummary[]): MediaSummary[] {
  const seen = new Set<string>();
  const out: MediaSummary[] = [];
  for (const item of items) {
    const key = `${item.mediaType}-${item.id}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(item);
    }
  }
  return out;
}

export async function getTrending(): Promise<MediaSummary[]> {
  if (!hasTmdbKey()) {
    return getMockCatalog()
      .slice(0, 12)
      .map(({ id, mediaType, title, posterUrl, year, genreSlugs }) => ({
        id,
        mediaType,
        title,
        posterUrl,
        year,
        genreSlugs,
      }));
  }
  try {
    const data = await tmdbFetch("/trending/all/week");
    return (data.results as RawResult[])
      .filter((r) => r.media_type === "movie" || r.media_type === "tv")
      .filter((r) => isReleased(r, r.media_type as MediaType))
      .map((r) => toSummary(r, r.media_type as MediaType));
  } catch {
    return [];
  }
}

export async function getByGenre(
  genreSlug: string,
  mediaType: MediaType | "all" = "all",
  page: number = 1
): Promise<MediaSummary[]> {
  if (!hasTmdbKey()) {
    if (page > 1) return [];
    return getMockCatalog()
      .filter(
        (m) =>
          m.genreSlugs.includes(genreSlug) &&
          (mediaType === "all" || m.mediaType === mediaType)
      )
      .map(({ id, mediaType: mt, title, posterUrl, year, genreSlugs }) => ({
        id,
        mediaType: mt,
        title,
        posterUrl,
        year,
        genreSlugs,
      }));
  }
  const genre = getGenreBySlug(genreSlug);
  if (!genre) return [];
  const types: MediaType[] = mediaType === "all" ? ["movie", "tv"] : [mediaType];
  try {
    const results = await Promise.all(
      types.map(async (type) => {
        const genreId = type === "movie" ? genre.movieGenreId : genre.tvGenreId;
        const data = await tmdbFetch(`/discover/${type}`, {
          with_genres: String(genreId),
          sort_by: "popularity.desc",
          region: REGION,
          page: String(page),
        });
        return (data.results as RawResult[]).map((r) => toSummary(r, type));
      })
    );
    return dedupeById(results.flat());
  } catch {
    return [];
  }
}

export async function getByRegion(
  regionSlug: string,
  page: number = 1
): Promise<MediaSummary[]> {
  const region = getRegionBySlug(regionSlug);
  if (!region) return [];
  if (!hasTmdbKey()) {
    return [];
  }
  const types: MediaType[] = ["movie", "tv"];
  try {
    const results = await Promise.all(
      types.map(async (type) => {
        const params: Record<string, string> = {
          with_original_language: region.language,
          sort_by: "popularity.desc",
          page: String(page),
        };
        if (region.requireGenreId) params.with_genres = String(region.requireGenreId);
        const data = await tmdbFetch(`/discover/${type}`, params);
        return (data.results as RawResult[]).map((r) => toSummary(r, type));
      })
    );
    return dedupeById(results.flat());
  } catch {
    return [];
  }
}

export async function getByMood(
  moodSlug: string,
  page: number = 1
): Promise<MediaSummary[]> {
  const mood = getMoodBySlug(moodSlug);
  if (!mood) return [];
  if (!hasTmdbKey()) {
    if (page > 1) return [];
    return getMockCatalog()
      .filter((m) => m.genreSlugs.some((g) => mood.genreSlugs.includes(g)))
      .map(({ id, mediaType, title, posterUrl, year, genreSlugs }) => ({
        id,
        mediaType,
        title,
        posterUrl,
        year,
        genreSlugs,
      }));
  }
  const results = await Promise.all(
    mood.genreSlugs.map((slug) => getByGenre(slug, "all", page))
  );
  return dedupeById(results.flat());
}

// Uses TMDB's "recommendations" endpoint rather than "similar" — similar is
// broad genre/keyword matching and tends to surface obscure, loosely-related
// titles, while recommendations is based on actual viewing behavior overlap
// and is noticeably higher quality for "people who watched X also watched Y".
export async function getSimilar(
  mediaType: MediaType,
  id: number,
  page: number = 1
): Promise<MediaSummary[]> {
  if (!hasTmdbKey()) return [];
  try {
    const data = await tmdbFetch(`/${mediaType}/${id}/recommendations`, { page: String(page) });
    return (data.results as RawResult[]).map((r) => toSummary(r, mediaType));
  } catch {
    return [];
  }
}

export async function searchMedia(
  query: string,
  page: number = 1
): Promise<MediaSummary[]> {
  if (!query.trim()) return [];
  if (!hasTmdbKey()) {
    if (page > 1) return [];
    const q = query.toLowerCase();
    return getMockCatalog()
      .filter((m) => m.title.toLowerCase().includes(q))
      .map(({ id, mediaType, title, posterUrl, year, genreSlugs }) => ({
        id,
        mediaType,
        title,
        posterUrl,
        year,
        genreSlugs,
      }));
  }
  try {
    const data = await tmdbFetch("/search/multi", {
      query,
      include_adult: "false",
      page: String(page),
    });
    return (data.results as RawResult[])
      .filter((r) => r.media_type === "movie" || r.media_type === "tv")
      .map((r) => toSummary(r, r.media_type as MediaType));
  } catch {
    return [];
  }
}

export async function getUpcoming(): Promise<MediaSummary[]> {
  if (!hasTmdbKey()) {
    return getMockCatalog()
      .slice(-8)
      .map(({ id, mediaType, title, posterUrl, year, genreSlugs }) => ({
        id,
        mediaType,
        title,
        posterUrl,
        year,
        genreSlugs,
      }));
  }
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [movies, tv] = await Promise.all([
      tmdbFetch("/discover/movie", {
        "primary_release_date.gte": today,
        sort_by: "primary_release_date.asc",
        region: REGION,
      }),
      tmdbFetch("/discover/tv", {
        "first_air_date.gte": today,
        sort_by: "first_air_date.asc",
      }),
    ]);
    const movieItems = (movies.results as RawResult[]).map((r) => toSummary(r, "movie"));
    const tvItems = (tv.results as RawResult[]).map((r) => toSummary(r, "tv"));
    // Interleave rather than concatenate-then-slice: a full page of movie
    // results would otherwise fill the 20-item cap before any tv show is
    // ever reached.
    const interleaved: MediaSummary[] = [];
    const maxLen = Math.max(movieItems.length, tvItems.length);
    for (let i = 0; i < maxLen; i++) {
      if (movieItems[i]) interleaved.push(movieItems[i]);
      if (tvItems[i]) interleaved.push(tvItems[i]);
    }
    return dedupeById(interleaved).slice(0, 20);
  } catch {
    return [];
  }
}

// Throws TmdbNotFoundError for a genuine 404, or a plain Error if TMDB was
// unreachable after retries — callers that need to tell those apart (the
// title detail page) should use this directly. Everything else should use
// `getDetails`, which swallows both into `null`.
export async function fetchDetailsRaw(
  mediaType: MediaType,
  id: number
): Promise<MediaDetail> {
  if (!hasTmdbKey()) {
    const mock = getMockById(mediaType, id);
    if (!mock) throw new TmdbNotFoundError(`mock:${mediaType}/${id}`);
    return mock;
  }
  {
    const data = await tmdbFetch(`/${mediaType}/${id}`, {
      append_to_response: "credits,watch/providers,videos",
    });
    const genres = (data.genres ?? []) as { id: number; name: string }[];
    const cast = (data.credits?.cast ?? [])
      .slice(0, 6)
      .map((c: { name: string; character: string }) => ({
        name: c.name,
        character: c.character,
      }));
    const providersRaw = data["watch/providers"]?.results?.[REGION];
    const rawProvider = (p: { provider_name: string; logo_path: string }) => p;
    function mapProviders(
      list: { provider_name: string; logo_path: string }[] | undefined,
      type: Provider["type"]
    ): Provider[] {
      return (list ?? []).map(rawProvider).map((p) => ({
        name: p.provider_name,
        logoUrl: `${LOGO_BASE}${p.logo_path}`,
        type,
      }));
    }
    const streamProviders = [
      ...mapProviders(providersRaw?.flatrate, "stream"),
      ...mapProviders(providersRaw?.ads, "stream"),
      ...mapProviders(providersRaw?.free, "stream"),
    ];
    const rentBuyProviders = [
      ...mapProviders(providersRaw?.rent, "rent"),
      ...mapProviders(providersRaw?.buy, "buy"),
    ];
    const seen = new Set<string>();
    const providers = [...streamProviders, ...rentBuyProviders].filter((p) => {
      const key = `${p.type}-${p.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const videos = (data.videos?.results ?? []) as {
      key: string;
      site: string;
      type: string;
      official: boolean;
    }[];
    const youtubeVideos = videos.filter((v) => v.site === "YouTube");
    const trailer =
      youtubeVideos.find((v) => v.type === "Trailer" && v.official) ??
      youtubeVideos.find((v) => v.type === "Trailer") ??
      youtubeVideos.find((v) => v.type === "Teaser");

    return {
      id: data.id,
      mediaType,
      title: mediaType === "movie" ? data.title : data.name,
      posterUrl: data.poster_path ? `${IMAGE_BASE}${data.poster_path}` : null,
      backdropUrl: data.backdrop_path ? `${BACKDROP_BASE}${data.backdrop_path}` : null,
      trailerKey: trailer?.key ?? null,
      year: (mediaType === "movie" ? data.release_date : data.first_air_date)?.slice(0, 4) ?? null,
      genreSlugs: tmdbGenreIdsToSlugs(genres.map((g) => g.id)),
      overview: data.overview ?? "",
      runtimeMinutes:
        mediaType === "movie" ? data.runtime ?? null : data.episode_run_time?.[0] ?? null,
      numberOfSeasons: mediaType === "tv" ? data.number_of_seasons ?? null : null,
      numberOfEpisodes: mediaType === "tv" ? data.number_of_episodes ?? null : null,
      cast,
      genres: genres.map((g) => g.name),
      providers,
    };
  }
}

export async function getDetails(
  mediaType: MediaType,
  id: number
): Promise<MediaDetail | null> {
  try {
    return await fetchDetailsRaw(mediaType, id);
  } catch {
    return null;
  }
}

export { GENRES };

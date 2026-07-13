export interface GenreDef {
  slug: string;
  label: string;
  movieGenreId: number;
  tvGenreId: number;
}

export const GENRES: GenreDef[] = [
  { slug: "thriller", label: "Thriller", movieGenreId: 53, tvGenreId: 9648 },
  { slug: "horror", label: "Horror", movieGenreId: 27, tvGenreId: 9648 },
  { slug: "comedy", label: "Comedy", movieGenreId: 35, tvGenreId: 35 },
  { slug: "rom-com", label: "Rom-Com", movieGenreId: 10749, tvGenreId: 10766 },
  { slug: "drama", label: "Drama", movieGenreId: 18, tvGenreId: 18 },
  { slug: "action", label: "Action", movieGenreId: 28, tvGenreId: 10759 },
  { slug: "sci-fi", label: "Sci-Fi", movieGenreId: 878, tvGenreId: 10765 },
  { slug: "animation", label: "Animation", movieGenreId: 16, tvGenreId: 16 },
  { slug: "documentary", label: "Documentary", movieGenreId: 99, tvGenreId: 99 },
  { slug: "fantasy", label: "Fantasy", movieGenreId: 14, tvGenreId: 10765 },
];

export function getGenreBySlug(slug: string): GenreDef | undefined {
  return GENRES.find((g) => g.slug === slug);
}

export function genreLabel(slug: string): string {
  return getGenreBySlug(slug)?.label ?? slug;
}

// Map raw TMDB genre ids (movie or tv) back to our slugs, best-effort.
const idToSlug = new Map<number, string>();
for (const g of GENRES) {
  if (!idToSlug.has(g.movieGenreId)) idToSlug.set(g.movieGenreId, g.slug);
  if (!idToSlug.has(g.tvGenreId)) idToSlug.set(g.tvGenreId, g.slug);
}

export function tmdbGenreIdsToSlugs(ids: number[]): string[] {
  const slugs = new Set<string>();
  for (const id of ids) {
    const slug = idToSlug.get(id);
    if (slug) slugs.add(slug);
  }
  return Array.from(slugs);
}

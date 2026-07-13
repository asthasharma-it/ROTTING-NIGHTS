export interface RegionDef {
  slug: string;
  label: string;
  language: string; // TMDB with_original_language
  requireGenreId?: number; // e.g. Animation for Anime, Drama for the *-drama entries
}

// Drama genre id (18) is shared between TMDB movie and tv genre lists.
const DRAMA_GENRE_ID = 18;

export const REGIONS: RegionDef[] = [
  { slug: "bollywood", label: "Bollywood", language: "hi" },
  { slug: "anime", label: "Anime", language: "ja", requireGenreId: 16 },
  { slug: "korean", label: "Korean", language: "ko" },
  { slug: "japanese", label: "Japanese", language: "ja" },
  { slug: "chinese", label: "Chinese", language: "zh" },
  { slug: "thai", label: "Thai", language: "th" },
  // Drama-focused cuts of each region — separate from the general regions
  // above so drama fans aren't wading through a region's action/comedy/etc
  // to find them.
  { slug: "korean-drama", label: "Korean Drama", language: "ko", requireGenreId: DRAMA_GENRE_ID },
  { slug: "japanese-drama", label: "Japanese Drama", language: "ja", requireGenreId: DRAMA_GENRE_ID },
  { slug: "thai-drama", label: "Thai Drama", language: "th", requireGenreId: DRAMA_GENRE_ID },
  { slug: "chinese-drama", label: "Chinese Drama", language: "zh", requireGenreId: DRAMA_GENRE_ID },
  { slug: "turkish-drama", label: "Turkish Drama", language: "tr", requireGenreId: DRAMA_GENRE_ID },
];

export function getRegionBySlug(slug: string): RegionDef | undefined {
  return REGIONS.find((r) => r.slug === slug);
}

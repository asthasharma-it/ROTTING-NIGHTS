export interface Mood {
  slug: string;
  label: string;
  emoji: string;
  genreSlugs: string[];
}

export const MOODS: Mood[] = [
  { slug: "cozy", label: "Cozy", emoji: "🛋️", genreSlugs: ["rom-com", "comedy", "drama"] },
  { slug: "spooky", label: "Spooky", emoji: "👻", genreSlugs: ["horror", "thriller"] },
  { slug: "heartbreak", label: "Heartbreak", emoji: "💔", genreSlugs: ["drama", "rom-com"] },
  { slug: "feel-good", label: "Feel Good", emoji: "🌞", genreSlugs: ["comedy", "animation", "rom-com"] },
  { slug: "mindless-fun", label: "Mindless Fun", emoji: "🍿", genreSlugs: ["action", "comedy"] },
  { slug: "intense", label: "Intense", emoji: "🔥", genreSlugs: ["thriller", "action", "horror"] },
  { slug: "nostalgic", label: "Nostalgic", emoji: "📼", genreSlugs: ["animation", "drama", "comedy"] },
  { slug: "rainy-day", label: "Rainy Day", emoji: "🌧️", genreSlugs: ["drama", "rom-com", "comedy"] },
];

export function getMoodBySlug(slug: string): Mood | undefined {
  return MOODS.find((m) => m.slug === slug);
}

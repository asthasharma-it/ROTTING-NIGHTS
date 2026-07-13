import { MediaSummary } from "@/types/media";
import { QUIZ_QUESTIONS } from "@/lib/quiz";

interface RatingLike {
  tmdbId: number;
  mediaType: string;
  score: number;
}

interface QuizAnswerLike {
  question: string;
  answer: string;
}

function genresForAnswer(questionId: string, label: string): string[] {
  const q = QUIZ_QUESTIONS.find((q) => q.id === questionId);
  const opt = q?.options.find((o) => o.label === label);
  return opt?.genreSlugs ?? [];
}

/**
 * Combines one-time quiz answers with rating history into a per-genre weight
 * map. Quiz answers give a flat nudge; ratings above/below 3 stars push the
 * genres of that title up or down proportionally.
 */
export function buildGenreWeights(
  quizAnswers: QuizAnswerLike[],
  ratings: RatingLike[],
  genresByRatedItem: Map<string, string[]>
): Map<string, number> {
  const weights = new Map<string, number>();
  const bump = (slug: string, amount: number) =>
    weights.set(slug, (weights.get(slug) ?? 0) + amount);

  for (const a of quizAnswers) {
    for (const slug of genresForAnswer(a.question, a.answer)) bump(slug, 1);
  }
  for (const r of ratings) {
    const genres = genresByRatedItem.get(`${r.mediaType}-${r.tmdbId}`) ?? [];
    const amount = r.score - 3;
    for (const slug of genres) bump(slug, amount);
  }
  return weights;
}

export function scoreAndSort(
  items: MediaSummary[],
  weights: Map<string, number>
): MediaSummary[] {
  return items
    .map((item) => ({
      item,
      score: item.genreSlugs.reduce((sum, g) => sum + (weights.get(g) ?? 0), 0),
    }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.item);
}

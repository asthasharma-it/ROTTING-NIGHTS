import { NextRequest, NextResponse } from "next/server";
import { searchMedia, getByGenre, getByMood, getByRegion, getTrending } from "@/lib/tmdb";
import { MediaType } from "@/types/media";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const genre = searchParams.get("genre") ?? "";
  const mood = searchParams.get("mood") ?? "";
  const region = searchParams.get("region") ?? "";
  const type = (searchParams.get("type") ?? "all") as MediaType | "all";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  let results;
  if (q) results = await searchMedia(q, page);
  else if (mood) results = await getByMood(mood, page);
  else if (region) results = await getByRegion(region, page);
  else if (genre) results = await getByGenre(genre, type, page);
  else results = page > 1 ? [] : await getTrending();

  if (genre && (q || mood || region)) {
    results = results.filter((r) => r.genreSlugs.includes(genre));
  }
  if (type !== "all") {
    results = results.filter((r) => r.mediaType === type);
  }

  return NextResponse.json(results);
}

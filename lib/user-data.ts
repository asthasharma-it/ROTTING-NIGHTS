import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MediaType, WatchStatusType } from "@/types/media";

export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function getStatusMap(): Promise<Map<string, WatchStatusType>> {
  const userId = await getCurrentUserId();
  if (!userId) return new Map();
  const rows = await prisma.watchStatus.findMany({ where: { userId } });
  return new Map(rows.map((r) => [`${r.mediaType}-${r.tmdbId}`, r.status]));
}

export async function getRatingMap(): Promise<Map<string, number>> {
  const userId = await getCurrentUserId();
  if (!userId) return new Map();
  const rows = await prisma.rating.findMany({ where: { userId } });
  return new Map(rows.map((r) => [`${r.mediaType}-${r.tmdbId}`, r.score]));
}

export async function getItemUserData(mediaType: MediaType, tmdbId: number) {
  const userId = await getCurrentUserId();
  if (!userId) return { status: null, rating: null, progress: null };

  const [status, rating, progress] = await Promise.all([
    prisma.watchStatus.findUnique({
      where: { userId_tmdbId_mediaType: { userId, tmdbId, mediaType } },
    }),
    prisma.rating.findUnique({
      where: { userId_tmdbId_mediaType: { userId, tmdbId, mediaType } },
    }),
    mediaType === "tv"
      ? prisma.episodeProgress.findUnique({ where: { userId_tmdbId: { userId, tmdbId } } })
      : Promise.resolve(null),
  ]);

  return {
    status: status?.status ?? null,
    rating: rating?.score ?? null,
    progress,
  };
}

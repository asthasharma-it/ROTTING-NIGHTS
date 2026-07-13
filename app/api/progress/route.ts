import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tmdbId, season, episode } = await req.json();
  if (!tmdbId || !season || !episode) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const result = await prisma.episodeProgress.upsert({
    where: { userId_tmdbId: { userId: session.user.id, tmdbId } },
    update: { season, episode },
    create: { userId: session.user.id, tmdbId, season, episode },
  });

  return NextResponse.json(result);
}

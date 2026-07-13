import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json([]);

  const rows = await prisma.rating.findMany({ where: { userId: session.user.id } });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tmdbId, mediaType, score } = await req.json();
  if (!tmdbId || !mediaType || !score || score < 1 || score > 5) {
    return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
  }

  const result = await prisma.rating.upsert({
    where: {
      userId_tmdbId_mediaType: {
        userId: session.user.id,
        tmdbId,
        mediaType,
      },
    },
    update: { score },
    create: { userId: session.user.id, tmdbId, mediaType, score },
  });

  return NextResponse.json(result);
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json([]);

  const rows = await prisma.watchStatus.findMany({ where: { userId: session.user.id } });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tmdbId, mediaType, status, title, posterPath } = await req.json();
  if (!tmdbId || !mediaType || !status) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const result = await prisma.watchStatus.upsert({
    where: {
      userId_tmdbId_mediaType: {
        userId: session.user.id,
        tmdbId,
        mediaType,
      },
    },
    update: { status, title, posterPath },
    create: {
      userId: session.user.id,
      tmdbId,
      mediaType,
      status,
      title: title ?? "",
      posterPath: posterPath ?? null,
    },
  });

  return NextResponse.json(result);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tmdbId = Number(searchParams.get("tmdbId"));
  const mediaType = searchParams.get("mediaType");
  if (!tmdbId || !mediaType) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await prisma.watchStatus.deleteMany({
    where: { userId: session.user.id, tmdbId, mediaType: mediaType as "movie" | "tv" },
  });

  return NextResponse.json({ ok: true });
}

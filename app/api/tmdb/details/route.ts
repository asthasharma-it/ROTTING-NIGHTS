import { NextRequest, NextResponse } from "next/server";
import { getDetails } from "@/lib/tmdb";
import { MediaType } from "@/types/media";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const id = Number(searchParams.get("id"));

  if ((type !== "movie" && type !== "tv") || !Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }

  const detail = await getDetails(type as MediaType, id);
  if (!detail) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(detail);
}

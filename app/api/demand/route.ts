import { NextResponse } from "next/server";
import { getDemandStats } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const window = Number.parseInt(url.searchParams.get("window") ?? "90", 10);
  const stats = getDemandStats(Number.isFinite(window) ? window : 90);
  return NextResponse.json(stats);
}

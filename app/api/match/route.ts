import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeMoodBoard, hasApiKey } from "@/lib/openai";
import { fallbackVision, rankFabrics } from "@/lib/matching";
import { getFabrics, getSuppliers } from "@/lib/data";
import type { Heritage, MatchVisionResult } from "@/lib/types";

const ALLOWED_HERITAGES: Heritage[] = [
  "Ankara",
  "Adire",
  "Aso-oke",
  "Akwete",
  "Kente",
  "Lace",
  "Cotton",
  "Linen",
];

export const runtime = "nodejs";
export const maxDuration = 30;

const visionHintSchema = z.object({
  dominantColors: z.array(z.string()),
  moodTags: z.array(z.string()),
  textureHints: z.array(z.string()),
  suggestedFabricTypes: z.array(z.string()),
  summary: z.string(),
});

const requestSchema = z.object({
  imageDataUrl: z.string().min(20),
  visionHint: visionHintSchema.optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "imageDataUrl is required" },
      { status: 400 },
    );
  }

  const fabrics = getFabrics();
  const suppliers = getSuppliers();

  let usedFallback = false;
  let vision: MatchVisionResult;
  if (parsed.data.visionHint) {
    vision = {
      ...parsed.data.visionHint,
      suggestedFabricTypes: parsed.data.visionHint.suggestedFabricTypes.filter(
        (s): s is Heritage => ALLOWED_HERITAGES.includes(s as Heritage),
      ),
    };
  } else if (hasApiKey()) {
    try {
      vision = await analyzeMoodBoard(parsed.data.imageDataUrl);
    } catch (err) {
      console.error("Vision call failed, using fallback", err);
      vision = fallbackVision();
      usedFallback = true;
    }
  } else {
    vision = fallbackVision();
    usedFallback = true;
  }

  const matches = rankFabrics(fabrics, suppliers, vision, 6);

  return NextResponse.json({
    vision,
    matches,
    usedFallback,
  });
}

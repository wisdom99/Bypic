import OpenAI from "openai";
import { z } from "zod";
import type { Heritage, MatchVisionResult } from "@/lib/types";

const HERITAGES: Heritage[] = [
  "Ankara",
  "Adire",
  "Aso-oke",
  "Akwete",
  "Kente",
  "Lace",
  "Cotton",
  "Linen",
];

const visionSchema = z.object({
  dominant_colors: z.array(z.string()).max(8),
  mood_tags: z.array(z.string()).max(8),
  texture_hints: z.array(z.string()).max(8),
  suggested_fabric_types: z.array(z.string()).max(8),
  summary: z.string(),
});

const SYSTEM_PROMPT = `You are Threadline's mood-board analyst. You translate a designer's inspiration image into structured fabric criteria for a Nigerian/African textile marketplace.

Always reply with valid JSON matching this exact shape:
{
  "dominant_colors": [hex codes like "#A8512E"],
  "mood_tags": [lowercase tags from this set: regal, ceremonial, festive, moody, soft, bold, minimalist, earthy, warm, fresh, calm, romantic, modern, casual, heritage, graphic, joyful, poetic, tactile, luxurious, rustic, tailored, resort, utilitarian],
  "texture_hints": [lowercase tags from: woven, hand-loomed, hand-resisted, tied-resist, printed, embroidered, beaded, sequined, lace, ribbed, slubby, twill, glossy, matte, midweight, lightweight, heavyweight, airy, silken, metallic, crisp],
  "suggested_fabric_types": ranked list from this set only: ["Ankara","Adire","Aso-oke","Akwete","Kente","Lace","Cotton","Linen"],
  "summary": one sentence describing the brief.
}

Pick 3-5 dominant_colors. Pick 3-5 mood_tags. Pick 2-4 texture_hints. Order suggested_fabric_types most relevant first.`;

const visionResponseSchema = z.object({
  dominant_colors: z.array(z.string()),
  mood_tags: z.array(z.string()),
  texture_hints: z.array(z.string()),
  suggested_fabric_types: z.array(z.string()),
  summary: z.string(),
});

export function hasApiKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export async function analyzeMoodBoard(
  imageDataUrl: string,
): Promise<MatchVisionResult> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze this mood board and return the JSON.",
          },
          { type: "image_url", image_url: { url: imageDataUrl } },
        ],
      },
    ],
    max_tokens: 600,
    temperature: 0.4,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw);
  const ok = visionResponseSchema.safeParse(parsed);
  if (!ok.success) {
    throw new Error(`Vision response did not match schema: ${ok.error.message}`);
  }
  // normalize fabric types against allowlist
  const suggested = ok.data.suggested_fabric_types
    .map((t) => normalizeHeritage(t))
    .filter((h): h is Heritage => h !== null);

  return {
    dominantColors: ok.data.dominant_colors.slice(0, 6),
    moodTags: ok.data.mood_tags.map((s) => s.toLowerCase()),
    textureHints: ok.data.texture_hints.map((s) => s.toLowerCase()),
    suggestedFabricTypes: suggested.length > 0 ? suggested : ["Ankara"],
    summary: ok.data.summary,
  };
}

function normalizeHeritage(input: string): Heritage | null {
  const lc = input.trim().toLowerCase();
  for (const h of HERITAGES) {
    if (h.toLowerCase() === lc) return h;
  }
  return null;
}

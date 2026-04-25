import { GoogleGenAI, Type } from "@google/genai";
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

const SYSTEM_INSTRUCTION = `You are Threadline's mood-board analyst. You translate a designer's inspiration image into structured fabric criteria for a Nigerian/African textile marketplace.

Pick 3-5 dominant_colors as hex codes (e.g. "#A8512E").
Pick 3-5 mood_tags from this set only (lowercase): regal, ceremonial, festive, moody, soft, bold, minimalist, earthy, warm, fresh, calm, romantic, modern, casual, heritage, graphic, joyful, poetic, tactile, luxurious, rustic, tailored, resort, utilitarian.
Pick 2-4 texture_hints from this set only (lowercase): woven, hand-loomed, hand-resisted, tied-resist, printed, embroidered, beaded, sequined, lace, ribbed, slubby, twill, glossy, matte, midweight, lightweight, heavyweight, airy, silken, metallic, crisp.
Order suggested_fabric_types most relevant first, choosing only from: Ankara, Adire, Aso-oke, Akwete, Kente, Lace, Cotton, Linen.
Write a one-sentence summary of the brief.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    dominant_colors: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    mood_tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    texture_hints: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    suggested_fabric_types: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    summary: { type: Type.STRING },
  },
  required: [
    "dominant_colors",
    "mood_tags",
    "texture_hints",
    "suggested_fabric_types",
    "summary",
  ],
  propertyOrdering: [
    "dominant_colors",
    "mood_tags",
    "texture_hints",
    "suggested_fabric_types",
    "summary",
  ],
};

const visionResponseSchema = z.object({
  dominant_colors: z.array(z.string()),
  mood_tags: z.array(z.string()),
  texture_hints: z.array(z.string()),
  suggested_fabric_types: z.array(z.string()),
  summary: z.string(),
});

export function hasApiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export async function analyzeMoodBoard(
  imageDataUrl: string,
): Promise<MatchVisionResult> {
  const { mimeType, data } = parseDataUrl(imageDataUrl);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          { text: "Analyze this mood board and return the JSON." },
          { inlineData: { mimeType, data } },
        ],
      },
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.4,
      maxOutputTokens: 800,
    },
  });

  const raw = response.text ?? "{}";
  const parsed = JSON.parse(raw);
  const ok = visionResponseSchema.safeParse(parsed);
  if (!ok.success) {
    throw new Error(`Vision response did not match schema: ${ok.error.message}`);
  }

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

function parseDataUrl(dataUrl: string): { mimeType: string; data: string } {
  const match = /^data:([^;,]+);base64,(.+)$/.exec(dataUrl);
  if (!match) {
    throw new Error("Expected a base64 data URL (data:<mime>;base64,<payload>)");
  }
  return { mimeType: match[1], data: match[2] };
}

function normalizeHeritage(input: string): Heritage | null {
  const lc = input.trim().toLowerCase();
  for (const h of HERITAGES) {
    if (h.toLowerCase() === lc) return h;
  }
  return null;
}

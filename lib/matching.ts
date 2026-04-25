import type {
  Fabric,
  Heritage,
  MatchResult,
  MatchVisionResult,
  Supplier,
} from "@/lib/types";

interface Lab {
  L: number;
  a: number;
  b: number;
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace("#", "").trim();
  if (m.length !== 6) return null;
  const num = Number.parseInt(m, 16);
  if (Number.isNaN(num)) return null;
  return [(num >> 16) & 0xff, (num >> 8) & 0xff, num & 0xff];
}

function rgbToLab([r, g, b]: [number, number, number]): Lab {
  const norm = [r, g, b].map((v) => {
    const c = v / 255;
    return c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92;
  });
  const [R, G, B] = norm;
  let X = R * 0.4124 + G * 0.3576 + B * 0.1805;
  let Y = R * 0.2126 + G * 0.7152 + B * 0.0722;
  let Z = R * 0.0193 + G * 0.1192 + B * 0.9505;
  X /= 0.95047;
  Y /= 1.0;
  Z /= 1.08883;
  const f = (t: number) =>
    t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  const fx = f(X);
  const fy = f(Y);
  const fz = f(Z);
  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

function deltaE(c1: Lab, c2: Lab): number {
  const dL = c1.L - c2.L;
  const da = c1.a - c2.a;
  const db = c1.b - c2.b;
  return Math.sqrt(dL * dL + da * da + db * db);
}

function paletteToLab(palette: string[]): Lab[] {
  return palette
    .map(hexToRgb)
    .filter((rgb): rgb is [number, number, number] => rgb !== null)
    .map(rgbToLab);
}

/**
 * Returns a 0..1 similarity score between two palettes.
 * 1 = identical, 0 = far apart. Uses bidirectional best-match deltaE in CIELAB.
 */
export function colorSimilarity(a: string[], b: string[]): number {
  const labA = paletteToLab(a);
  const labB = paletteToLab(b);
  if (labA.length === 0 || labB.length === 0) return 0;

  const bestForEach = (xs: Lab[], ys: Lab[]) =>
    xs.map((x) => Math.min(...ys.map((y) => deltaE(x, y))));

  const distancesA = bestForEach(labA, labB);
  const distancesB = bestForEach(labB, labA);
  const all = [...distancesA, ...distancesB];
  const avgDeltaE = all.reduce((s, v) => s + v, 0) / all.length;
  // deltaE of ~0 is identical; ~30 is "different family"; clamp to 0..1.
  const scaled = Math.max(0, 1 - avgDeltaE / 60);
  return scaled;
}

function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0;
  const sa = new Set(a.map((s) => s.toLowerCase()));
  const sb = new Set(b.map((s) => s.toLowerCase()));
  const inter = [...sa].filter((s) => sb.has(s)).length;
  const union = new Set([...sa, ...sb]).size;
  return union === 0 ? 0 : inter / union;
}

function fabricTypeRank(
  fabricHeritage: Heritage,
  suggested: Heritage[],
): number {
  if (suggested.length === 0) return 0.5;
  const idx = suggested.findIndex((h) => h === fabricHeritage);
  if (idx === -1) return 0;
  return 1 - idx / suggested.length;
}

const WEIGHTS = {
  color: 0.45,
  mood: 0.25,
  fabricType: 0.2,
  texture: 0.1,
};

export function rankFabrics(
  fabrics: Fabric[],
  suppliers: Supplier[],
  vision: MatchVisionResult,
  limit = 6,
): MatchResult[] {
  const supplierIndex = new Map(suppliers.map((s) => [s.id, s]));
  const ranked = fabrics
    .map((fabric) => {
      const color = colorSimilarity(fabric.palette, vision.dominantColors);
      const mood = jaccard(fabric.moodTags, vision.moodTags);
      const fabricType = fabricTypeRank(
        fabric.heritage,
        vision.suggestedFabricTypes,
      );
      const texture = jaccard(fabric.textureTags, vision.textureHints);
      const score =
        WEIGHTS.color * color +
        WEIGHTS.mood * mood +
        WEIGHTS.fabricType * fabricType +
        WEIGHTS.texture * texture;
      return {
        fabric,
        supplier: supplierIndex.get(fabric.supplierId)!,
        score,
        reasoning: buildReasoning({
          fabric,
          vision,
          color,
          mood,
          fabricType,
        }),
        breakdown: {
          color: Number(color.toFixed(3)),
          mood: Number(mood.toFixed(3)),
          fabricType: Number(fabricType.toFixed(3)),
          texture: Number(texture.toFixed(3)),
        },
      };
    })
    .sort((a, b) => b.score - a.score);

  return ranked.slice(0, limit);
}

function buildReasoning({
  fabric,
  vision,
  color,
  mood,
  fabricType,
}: {
  fabric: Fabric;
  vision: MatchVisionResult;
  color: number;
  mood: number;
  fabricType: number;
}): string {
  const parts: string[] = [];

  if (color > 0.55) {
    parts.push(
      `mirrors the ${describePalette(vision.dominantColors)} palette of your board`,
    );
  } else if (color > 0.3) {
    parts.push(
      `picks up the ${describePalette(vision.dominantColors)} undertones`,
    );
  }

  const sharedMoods = fabric.moodTags.filter((m) =>
    vision.moodTags.includes(m.toLowerCase()),
  );
  if (sharedMoods.length > 0 && mood > 0) {
    parts.push(`matches the ${sharedMoods.slice(0, 2).join(" and ")} mood`);
  } else if (mood === 0 && vision.moodTags.length > 0) {
    parts.push(`offers a ${fabric.moodTags[0]} contrast`);
  }

  if (fabricType > 0.7) {
    parts.push(`exactly the ${fabric.heritage} weave the AI suggested`);
  } else if (fabricType > 0) {
    parts.push(`a strong ${fabric.heritage} alternative`);
  }

  const subject = `${fabric.name} from ${fabric.region}`;
  if (parts.length === 0) {
    return `${subject} sits adjacent to the brief — a wildcard worth a sample yard.`;
  }
  return `${subject} ${parts.join(", ")}.`;
}

function describePalette(colors: string[]): string {
  if (colors.length === 0) return "neutral";
  const labs = paletteToLab(colors);
  if (labs.length === 0) return "neutral";
  // Drop near-neutrals (highlights and pure blacks) from averaging so the
  // chromatic personality of the palette comes through.
  const chromatic =
    labs.filter((l) => Math.hypot(l.a, l.b) > 6 && l.L > 12 && l.L < 92);
  const sample = chromatic.length > 0 ? chromatic : labs;
  const avg = sample.reduce(
    (s, l) => ({ L: s.L + l.L, a: s.a + l.a, b: s.b + l.b }),
    { L: 0, a: 0, b: 0 },
  );
  avg.L /= sample.length;
  avg.a /= sample.length;
  avg.b /= sample.length;
  const warm = avg.b > 12 || avg.a > 12;
  const cool = avg.b < -10 || (avg.a < -4 && avg.b < 0);
  const dark = avg.L < 40;
  const light = avg.L > 70;
  if (dark && cool) return "deep indigo";
  if (dark && warm) return "smoked terracotta";
  if (dark) return "moody";
  if (light && warm) return "ivory and amber";
  if (light && cool) return "sky and chalk";
  if (warm) return "earth-warm";
  if (cool) return "cool-toned";
  return "balanced";
}

/**
 * Deterministic fallback when the OpenAI API key is missing.
 * Uses a fixed "designer mood-board archetype" so the demo still feels
 * intentional. Surfaces variety across heritages and regions.
 */
export function fallbackVision(): MatchVisionResult {
  return {
    dominantColors: ["#1F2854", "#A8512E", "#F5EFE5", "#161513"],
    moodTags: ["regal", "earthy", "moody", "heritage"],
    textureHints: ["hand-loomed", "matte", "midweight"],
    suggestedFabricTypes: ["Adire", "Aso-oke", "Akwete", "Ankara"],
    summary:
      "A regal, earth-toned brief leaning indigo and terracotta — heritage weaves with depth.",
  };
}

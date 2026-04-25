"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Compass,
  Loader2,
  Palette,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import type { MatchResult, MatchVisionResult } from "@/lib/types";
import { MoodboardUploader } from "./MoodboardUploader";
import { MatchResultCard } from "./MatchResultCard";
import { PaletteSwatches } from "./PaletteSwatches";

interface MatchResponse {
  vision: MatchVisionResult;
  matches: MatchResult[];
  usedFallback: boolean;
}

export function MatchPageClient() {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MatchResponse | null>(null);

  const runMatch = async (dataUrl: string, visionHint?: MatchVisionResult) => {
    setImageDataUrl(dataUrl);
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl: dataUrl, visionHint }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: MatchResponse = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Match failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImageDataUrl(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="container-page py-12">
      <header className="mb-10 max-w-3xl">
        <p className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-terracotta-600">
          <WandSparkles className="h-3.5 w-3.5" /> AI Mood-Board Match
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-charcoal-900 md:text-5xl">
          From inspiration to fabric, in one upload.
        </h1>
        <p className="mt-3 text-base text-charcoal-400">
          Drop an image — a Pinterest board, a runway shot, a sketch, a paint
          chip. We&apos;ll extract palette, mood, and texture, then rank
          fabrics from verified Nigerian producers with a one-line reason for
          every match.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-5">
          <MoodboardUploader
            selected={imageDataUrl}
            onSelect={runMatch}
            onClear={reset}
            disabled={loading}
          />

          {result?.vision && !loading && (
            <VisionSummary
              vision={result.vision}
              usedFallback={result.usedFallback}
            />
          )}
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="card flex items-center gap-3 px-5 py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-700" />
                  <p className="text-sm text-charcoal-700">
                    Reading your board, extracting palette and mood, and
                    scoring 32 fabrics across 6 hubs…
                  </p>
                </div>
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonResult key={i} />
                ))}
              </motion.div>
            )}

            {!loading && error && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="card flex items-start gap-3 p-5 text-sm"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 flex-none text-terracotta-600" />
                <div>
                  <p className="font-medium text-charcoal-900">
                    Couldn&apos;t complete the match
                  </p>
                  <p className="text-charcoal-400">
                    {error}. Try a different image, or reset and use a sample
                    brief.
                  </p>
                </div>
              </motion.div>
            )}

            {!loading && !result && !error && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card flex flex-col items-center gap-3 p-10 text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cream-100 text-charcoal-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <p className="font-display text-xl font-semibold text-charcoal-900">
                  Your matches will appear here
                </p>
                <p className="max-w-md text-sm text-charcoal-400">
                  Each match comes with a score breakdown — colour, mood,
                  heritage and texture — plus a plain-English reason for why
                  it fits your brief.
                </p>
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-cream-100 px-3 py-1 text-[11px] text-charcoal-700">
                  <Compass className="h-3 w-3" /> Pro tip: try one of the
                  sample briefs to see it in action.
                </p>
              </motion.div>
            )}

            {!loading && result && result.matches.length > 0 && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {result.matches.map((m, i) => (
                  <MatchResultCard
                    key={m.fabric.id}
                    result={m}
                    rank={i}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function VisionSummary({
  vision,
  usedFallback,
}: {
  vision: MatchVisionResult;
  usedFallback: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card space-y-4 p-5"
    >
      <div className="flex items-center justify-between">
        <p className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-terracotta-600">
          <Palette className="h-3.5 w-3.5" /> AI brief
        </p>
        {usedFallback && (
          <span className="rounded-full bg-cream-100 px-2 py-0.5 text-[10px] uppercase tracking-wider text-charcoal-400">
            Demo mode
          </span>
        )}
      </div>
      <p className="text-sm leading-relaxed text-charcoal-700">
        {vision.summary}
      </p>
      <div>
        <p className="label">Palette</p>
        <div className="flex items-center gap-2">
          <PaletteSwatches palette={vision.dominantColors} size="lg" />
          <span className="font-mono text-[10px] text-charcoal-400">
            {vision.dominantColors.slice(0, 4).join(" · ")}
          </span>
        </div>
      </div>
      <Group label="Mood" tags={vision.moodTags} />
      <Group label="Texture" tags={vision.textureHints} />
      <Group label="Suggested heritage" tags={vision.suggestedFabricTypes} />
    </motion.div>
  );
}

function Group({ label, tags }: { label: string; tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <div>
      <p className="label">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span key={tag} className="pill">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function SkeletonResult() {
  return (
    <div className="card flex gap-4 overflow-hidden p-0">
      <div className="shimmer h-44 w-48 flex-none" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="shimmer h-3 w-16 rounded-full" />
        <div className="shimmer h-6 w-3/5 rounded" />
        <div className="shimmer h-4 w-2/5 rounded" />
        <div className="shimmer h-12 w-full rounded-xl" />
        <div className="flex gap-2">
          <div className="shimmer h-7 w-20 rounded-full" />
          <div className="shimmer h-7 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

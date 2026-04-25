"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { FabricArtwork } from "./FabricArtwork";
import type { Heritage, MatchVisionResult } from "@/lib/types";

interface MoodboardUploaderProps {
  onSelect: (dataUrl: string, hint?: MatchVisionResult) => void;
  onClear: () => void;
  selected: string | null;
  disabled?: boolean;
}

interface SampleBoard {
  id: string;
  label: string;
  heritage: Heritage;
  palette: string[];
  vision: MatchVisionResult;
}

const SAMPLE_BOARDS: SampleBoard[] = [
  {
    id: "regal-indigo",
    label: "Regal indigo",
    heritage: "Adire",
    palette: ["#0E1330", "#1F2854", "#2D3870", "#5A66A3", "#FBF7F1"],
    vision: {
      dominantColors: ["#0E1330", "#1F2854", "#2D3870", "#5A66A3", "#FBF7F1"],
      moodTags: ["regal", "ceremonial", "moody", "heritage"],
      textureHints: ["hand-loomed", "matte", "midweight"],
      suggestedFabricTypes: ["Adire", "Aso-oke", "Akwete"],
      summary: "A regal, indigo-led brief leaning ceremonial — heritage weaves with depth.",
    },
  },
  {
    id: "earth-resort",
    label: "Earth-warm resort",
    heritage: "Linen",
    palette: ["#C26841", "#F4D4BF", "#FBEEE6", "#EADFCC", "#7E3A20"],
    vision: {
      dominantColors: ["#C26841", "#F4D4BF", "#FBEEE6", "#7E3A20"],
      moodTags: ["soft", "warm", "resort", "earthy"],
      textureHints: ["airy", "lightweight", "matte"],
      suggestedFabricTypes: ["Linen", "Cotton", "Adire"],
      summary: "A breezy, earth-toned resort palette — soft warm neutrals.",
    },
  },
  {
    id: "festive-graphic",
    label: "Festive graphic",
    heritage: "Ankara",
    palette: ["#7E3A20", "#C26841", "#3E4B8C", "#F4D4BF", "#161513"],
    vision: {
      dominantColors: ["#7E3A20", "#C26841", "#3E4B8C", "#F4D4BF"],
      moodTags: ["bold", "festive", "graphic", "joyful"],
      textureHints: ["printed", "crisp", "midweight"],
      suggestedFabricTypes: ["Ankara", "Akwete", "Kente"],
      summary: "A festive, graphic brief — saturated palette, statement-print energy.",
    },
  },
];

const SAMPLE_VIEWBOX = 320;

export function MoodboardUploader({
  onSelect,
  onClear,
  selected,
  disabled,
}: MoodboardUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") onSelect(reader.result);
      };
      reader.readAsDataURL(file);
    },
    [onSelect],
  );

  const handleSample = (sample: SampleBoard) => {
    const svg = sampleSvg(sample);
    const dataUrl = `data:image/svg+xml;base64,${typeof window !== "undefined" ? window.btoa(unescape(encodeURIComponent(svg))) : ""}`;
    onSelect(dataUrl, sample.vision);
  };

  return (
    <div className="space-y-4">
      <motion.div
        layout
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (disabled) return;
          const file = e.dataTransfer.files?.[0];
          if (file && file.type.startsWith("image/")) handleFile(file);
        }}
        onClick={() => !disabled && !selected && inputRef.current?.click()}
        className={cn(
          "relative flex min-h-[260px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed transition",
          selected
            ? "cursor-default border-charcoal-100"
            : dragOver
              ? "border-indigo-700 bg-indigo-50/40"
              : "border-charcoal-100 bg-white hover:border-indigo-700/50 hover:bg-cream-50",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        {selected ? (
          <>
            <Image
              src={selected}
              alt="Mood-board upload preview"
              fill
              unoptimized
              className="object-cover"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-charcoal-900/70 px-3 py-1.5 text-xs text-cream-50 backdrop-blur transition hover:bg-charcoal-900"
            >
              <X className="h-3 w-3" /> Replace
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-700">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-xl font-semibold text-charcoal-900">
                Drop a mood board, sketch, or runway shot
              </p>
              <p className="mt-1 text-sm text-charcoal-400">
                We extract palette, texture and mood, and rank fabrics from
                Nigerian producers.
              </p>
            </div>
            <button type="button" className="btn-primary mt-1">
              <ImageIcon className="h-4 w-4" /> Choose file
            </button>
            <p className="text-[11px] text-charcoal-400">
              PNG or JPG, up to 10 MB. Drag-and-drop also works.
            </p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </motion.div>

      {!selected && (
        <div>
          <p className="label">Or try a sample brief</p>
          <div className="grid grid-cols-3 gap-2">
            {SAMPLE_BOARDS.map((s) => (
              <button
                key={s.id}
                type="button"
                disabled={disabled}
                onClick={() => handleSample(s)}
                className="group relative aspect-[5/4] overflow-hidden rounded-xl border border-charcoal-100 transition hover:border-indigo-700/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FabricArtwork
                  palette={s.palette}
                  heritage={s.heritage}
                  seed={s.id}
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal-900/80 to-transparent p-2 text-left text-[11px] font-medium text-cream-50">
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function sampleSvg(sample: SampleBoard): string {
  const colors = sample.palette;
  const sw = SAMPLE_VIEWBOX;
  const sh = Math.round(sw * 1.25);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw} ${sh}" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${colors[0]}" />
      <stop offset="60%" stop-color="${colors[1]}" />
      <stop offset="100%" stop-color="${colors[3] ?? colors[2]}" />
    </linearGradient>
  </defs>
  <rect width="${sw}" height="${sh}" fill="url(#bg)" />
  ${repeatedShapes(sample, sw, sh)}
</svg>`;
}

function repeatedShapes(
  sample: SampleBoard,
  sw: number,
  sh: number,
): string {
  const colors = sample.palette;
  const out: string[] = [];
  const count = 24;
  for (let i = 0; i < count; i++) {
    const x = ((i * 53) % sw) + (i % 3) * 11;
    const y = ((i * 89) % sh) + (i % 4) * 13;
    const r = 30 + (i % 5) * 14;
    const fill = colors[i % 5];
    out.push(
      `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" opacity="0.25" />`,
    );
  }
  return out.join("\n");
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, BadgeCheck, MapPin, Send, Sparkles } from "lucide-react";
import type { MatchResult } from "@/lib/types";
import { formatNaira } from "@/lib/utils";
import { HeritageBadge } from "./HeritageBadge";
import { PaletteSwatches } from "./PaletteSwatches";
import { InquiryDialog } from "./InquiryDialog";
import { FabricArtwork } from "./FabricArtwork";

export function MatchResultCard({
  result,
  rank,
}: {
  result: MatchResult;
  rank: number;
}) {
  const [open, setOpen] = useState(false);
  const { fabric, supplier, score, reasoning, breakdown } = result;
  const scorePct = Math.round(score * 100);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: rank * 0.05 }}
      className="card flex flex-col overflow-hidden md:flex-row"
    >
      <Link
        href={`/fabrics/${fabric.id}`}
        className="relative block aspect-[4/5] flex-none overflow-hidden bg-cream-100 md:aspect-auto md:w-72"
      >
        <FabricArtwork
          palette={fabric.palette}
          heritage={fabric.heritage}
          seed={fabric.id}
        />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span className="rounded-full bg-charcoal-900/80 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-cream-50 backdrop-blur">
            #{rank + 1} match
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <HeritageBadge heritage={fabric.heritage} />
            <h3 className="mt-2 font-display text-2xl font-semibold leading-tight text-charcoal-900">
              {fabric.name}
            </h3>
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-charcoal-400">
              <MapPin className="h-3 w-3" /> {fabric.region}
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                {supplier.name}
                {supplier.verified && (
                  <BadgeCheck className="h-3 w-3 text-indigo-700" />
                )}
              </span>
            </p>
          </div>
          <div className="flex flex-col items-end">
            <p className="font-display text-2xl font-semibold text-charcoal-900">
              {scorePct}
              <span className="ml-0.5 text-sm font-normal text-charcoal-400">
                /100
              </span>
            </p>
            <PaletteSwatches palette={fabric.palette} className="mt-1" />
          </div>
        </div>

        <div className="rounded-xl bg-cream-100 px-3 py-2.5">
          <p className="flex items-start gap-2 text-sm leading-snug text-charcoal-700">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-none text-terracotta-500" />
            <span>{reasoning}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-charcoal-400">
          <ScoreChip label="Color" value={breakdown.color} />
          <ScoreChip label="Mood" value={breakdown.mood} />
          <ScoreChip label="Heritage" value={breakdown.fabricType} />
          <ScoreChip label="Texture" value={breakdown.texture} />
        </div>

        <div className="mt-1 flex flex-wrap items-center justify-between gap-3 border-t border-charcoal-100 pt-3">
          <p className="text-sm font-medium text-charcoal-900">
            {formatNaira(fabric.pricePerYardNgn)}
            <span className="ml-0.5 text-xs font-normal text-charcoal-400">
              /yd · MOQ {fabric.minOrderYards} yds
            </span>
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={`/fabrics/${fabric.id}`}
              className="btn-ghost"
            >
              <ArrowUpRight className="h-4 w-4" /> View
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="btn-primary"
            >
              <Send className="h-4 w-4" /> Send RFQ
            </button>
          </div>
        </div>
      </div>

      <InquiryDialog
        open={open}
        onClose={() => setOpen(false)}
        fabric={fabric}
        supplier={supplier}
      />
    </motion.article>
  );
}

function ScoreChip({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-charcoal-100 bg-white px-2 py-0.5 font-medium">
      <span className="uppercase tracking-wider">{label}</span>
      <span className="text-charcoal-700">{pct}</span>
    </span>
  );
}

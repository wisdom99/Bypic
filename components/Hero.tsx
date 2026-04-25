"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ScanSearch } from "lucide-react";
import { FabricArtwork } from "./FabricArtwork";
import type { Heritage } from "@/lib/types";

interface HeroTile {
  id: string;
  heritage: Heritage;
  label: string;
  palette: string[];
  className: string;
}

const HERO_TILES: HeroTile[] = [
  {
    id: "tile-adire",
    heritage: "Adire",
    label: "Indigo Adire · Abeokuta",
    palette: ["#0E1330", "#1F2854", "#2D3870", "#5A66A3", "#FBF7F1"],
    className: "aspect-[3/4] translate-y-6",
  },
  {
    id: "tile-ankara",
    heritage: "Ankara",
    label: "Wax Ankara · Lagos",
    palette: ["#7E3A20", "#C26841", "#3E4B8C", "#F4D4BF", "#FBEEE6"],
    className: "aspect-[3/4]",
  },
  {
    id: "tile-akwete",
    heritage: "Akwete",
    label: "Akwete · Aba",
    palette: ["#7E3A20", "#A8512E", "#EADFCC", "#161D3E", "#FBF7F1"],
    className: "aspect-[4/3]",
  },
  {
    id: "tile-asooke",
    heritage: "Aso-oke",
    label: "Aso-oke · Ede",
    palette: ["#7E3A20", "#A8512E", "#2A2926", "#C26841", "#EADFCC"],
    className: "aspect-[4/3] -translate-y-3",
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream-50">
      <div className="grain-bg absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="container-page relative grid gap-10 py-20 md:grid-cols-[1.1fr_0.9fr] md:py-28">
        <div className="flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="pill mb-5 w-fit"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-terracotta-500" />
            For Nigerian fashion designers
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-charcoal-900 md:text-6xl"
          >
            Source African fabric in{" "}
            <span className="italic text-terracotta-600">24 hours</span>, not
            24 days.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-5 max-w-xl text-base text-charcoal-400 md:text-lg"
          >
            Threadline connects designers with verified producers across Lagos,
            Aba, Kano, Onitsha, Abeokuta and Ibadan. Browse Ankara, Adire,
            Aso-oke, Akwete, Kente and lace — or upload a mood board and let AI
            match you to the right fabric and producer.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link href="/match" className="btn-terracotta">
              <Sparkles className="h-4 w-4" />
              Match by mood board
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/marketplace" className="btn-ghost">
              <ScanSearch className="h-4 w-4" />
              Browse marketplace
            </Link>
          </motion.div>
          <motion.dl
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="mt-10 grid grid-cols-3 gap-6 border-t border-charcoal-100 pt-6"
          >
            {[
              { v: "10+", l: "Verified producers" },
              { v: "32", l: "Fabric stories" },
              { v: "6", l: "Textile hubs" },
            ].map((s) => (
              <div key={s.l}>
                <dt className="font-display text-2xl font-semibold text-charcoal-900">
                  {s.v}
                </dt>
                <dd className="mt-1 text-xs uppercase tracking-wider text-charcoal-400">
                  {s.l}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative grid grid-cols-2 gap-3"
        >
          {HERO_TILES.map((tile) => (
            <HeroTileCard key={tile.id} tile={tile} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function HeroTileCard({ tile }: { tile: HeroTile }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-charcoal-100 ${tile.className}`}
    >
      <FabricArtwork
        palette={tile.palette}
        heritage={tile.heritage}
        seed={tile.id}
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-3">
        <p className="text-xs font-medium text-cream-50">{tile.label}</p>
      </div>
    </div>
  );
}

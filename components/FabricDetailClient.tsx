"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Boxes,
  Clock,
  MapPin,
  PackageCheck,
  Send,
  Sparkles,
  Star,
} from "lucide-react";
import type { Fabric, Supplier } from "@/lib/types";
import { formatLeadTime, formatNaira } from "@/lib/utils";
import { HeritageBadge } from "./HeritageBadge";
import { PaletteSwatches } from "./PaletteSwatches";
import { InquiryDialog } from "./InquiryDialog";
import { FabricCard } from "./FabricCard";
import { FabricArtwork } from "./FabricArtwork";

export function FabricDetailClient({
  fabric,
  supplier,
  related,
  relatedSupplierIndex,
}: {
  fabric: Fabric;
  supplier: Supplier;
  related: Fabric[];
  relatedSupplierIndex: Record<string, Supplier>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="container-page py-10">
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-1.5 text-sm text-charcoal-400 transition hover:text-charcoal-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to marketplace
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-cream-100">
            <FabricArtwork
              palette={fabric.palette}
              heritage={fabric.heritage}
              seed={fabric.id}
            />
            <div className="absolute left-4 top-4">
              <HeritageBadge heritage={fabric.heritage} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-terracotta-600">
              {fabric.fabricType}
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-charcoal-900 md:text-5xl">
              {fabric.name}
            </h1>
            <p className="mt-3 text-base text-charcoal-400">
              {fabric.description}
            </p>
          </div>

          <div className="card flex flex-col gap-4 p-5">
            <div className="flex items-center justify-between">
              <p className="font-display text-3xl font-semibold text-charcoal-900">
                {formatNaira(fabric.pricePerYardNgn)}
                <span className="ml-1 text-sm font-normal text-charcoal-400">
                  per yard
                </span>
              </p>
              <PaletteSwatches palette={fabric.palette} size="lg" />
            </div>
            <dl className="grid grid-cols-2 gap-y-4 sm:grid-cols-4">
              <Stat
                icon={<Boxes className="h-3.5 w-3.5" />}
                label="MOQ"
                value={`${fabric.minOrderYards} yards`}
              />
              <Stat
                icon={<PackageCheck className="h-3.5 w-3.5" />}
                label="In stock"
                value={`${fabric.inStockYards} yds`}
              />
              <Stat
                icon={<Clock className="h-3.5 w-3.5" />}
                label="Lead time"
                value={`~${fabric.leadTimeDays} days`}
              />
              <Stat
                icon={<MapPin className="h-3.5 w-3.5" />}
                label="Region"
                value={fabric.region}
              />
            </dl>
            <div className="border-t border-charcoal-100 pt-4">
              <p className="label">Composition</p>
              <p className="text-sm text-charcoal-700">{fabric.composition}</p>
            </div>
            <div>
              <p className="label">Mood</p>
              <div className="flex flex-wrap gap-1.5">
                {fabric.moodTags.map((tag) => (
                  <span key={tag} className="pill">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="btn-primary"
              >
                <Send className="h-4 w-4" /> Send inquiry
              </button>
              <Link
                href={`/match`}
                className="btn-ghost"
              >
                <Sparkles className="h-4 w-4" /> Find similar by mood
              </Link>
            </div>
          </div>

          <Link
            href={`/suppliers/${supplier.id}`}
            className="card group flex items-start gap-4 p-5 transition hover:border-charcoal-700/30"
          >
            <div
              className="flex h-12 w-12 flex-none items-center justify-center rounded-full font-display text-cream-50"
              style={{ backgroundColor: supplier.avatarColor }}
            >
              {supplier.name
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0])
                .join("")}
            </div>
            <div className="flex-1">
              <p className="flex items-center gap-1.5 font-display text-lg font-semibold text-charcoal-900">
                {supplier.name}
                {supplier.verified && (
                  <BadgeCheck className="h-4 w-4 text-indigo-700" />
                )}
              </p>
              <p className="mt-0.5 text-sm text-charcoal-400">
                {supplier.tagline}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-charcoal-400">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {supplier.region}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3 w-3" /> {supplier.rating.toFixed(1)} ·{" "}
                  {supplier.ordersFulfilled} orders fulfilled
                </span>
                <span>Lead {formatLeadTime(supplier.leadTimeDays)}</span>
              </div>
            </div>
            <ArrowLeft className="h-4 w-4 rotate-180 text-charcoal-400 transition group-hover:translate-x-0.5 group-hover:text-charcoal-700" />
          </Link>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl font-semibold text-charcoal-900">
            More from {supplier.name}
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {related.map((f) => (
              <FabricCard
                key={f.id}
                fabric={f}
                supplier={relatedSupplierIndex[f.supplierId]}
              />
            ))}
          </div>
        </section>
      )}

      <InquiryDialog
        open={open}
        onClose={() => setOpen(false)}
        fabric={fabric}
        supplier={supplier}
      />
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-charcoal-400">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-charcoal-900">{value}</dd>
    </div>
  );
}

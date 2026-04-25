"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  BellRing,
  Boxes,
  Flame,
  MapPin,
  Package,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import type {
  DemandFabricStat,
  DemandFeedItem,
  DemandHeritageStat,
  DemandMoodStat,
  DemandPaletteStat,
  DemandRegionStat,
  Heritage,
  NigerianHub,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { HeritageBadge } from "./HeritageBadge";

type TimeFilter = 7 | 30 | 90;

interface DemandBoardClientProps {
  feed: DemandFeedItem[];
}

interface ComputedStats {
  totalInterests: number;
  totalYards: number;
  uniqueDesigners: number;
  byHeritage: DemandHeritageStat[];
  byRegion: DemandRegionStat[];
  byFabric: DemandFabricStat[];
  trendingMoods: DemandMoodStat[];
  trendingPalette: DemandPaletteStat[];
}

export function DemandBoardClient({ feed }: DemandBoardClientProps) {
  const [windowDays, setWindowDays] = useState<TimeFilter>(30);
  const [heritageFilter, setHeritageFilter] = useState<Heritage | "all">("all");
  const [regionFilter, setRegionFilter] = useState<NigerianHub | "all">("all");

  const allHeritages = useMemo(() => unique(feed.map((f) => f.heritage)), [
    feed,
  ]);
  const allRegions = useMemo(() => unique(feed.map((f) => f.region)), [feed]);

  const filteredFeed = useMemo(() => {
    const since = Date.now() - windowDays * 24 * 60 * 60 * 1000;
    return feed.filter(
      (f) =>
        new Date(f.createdAt).getTime() >= since &&
        (heritageFilter === "all" || f.heritage === heritageFilter) &&
        (regionFilter === "all" || f.region === regionFilter),
    );
  }, [feed, windowDays, heritageFilter, regionFilter]);

  const stats = useMemo(() => computeStats(filteredFeed), [filteredFeed]);

  const heritageOptions: Array<Heritage | "all"> = ["all", ...allHeritages];
  const regionOptions: Array<NigerianHub | "all"> = ["all", ...allRegions];

  return (
    <div className="space-y-10">
      <header className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-terracotta-50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-terracotta-700">
              <Flame className="h-3 w-3" /> For producers
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-charcoal-900 md:text-5xl">
              What designers are asking for, right now
            </h1>
            <p className="mt-3 max-w-2xl text-base text-charcoal-400">
              A live view of every &ldquo;Express interest&rdquo; signal on the
              platform. Plan your next dye batch, weave run, or print order
              around real demand — not guesswork.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setWindowDays(d as TimeFilter)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-medium transition",
                  windowDays === d
                    ? "bg-charcoal-900 text-cream-50"
                    : "bg-white text-charcoal-700 ring-1 ring-charcoal-100 hover:bg-cream-100",
                )}
              >
                Last {d}d
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryCard
            icon={<BellRing className="h-4 w-4" />}
            label="Interest signals"
            value={stats.totalInterests.toString()}
            sub={`in the last ${windowDays} days`}
          />
          <SummaryCard
            icon={<Package className="h-4 w-4" />}
            label="Yards in flight"
            value={stats.totalYards.toLocaleString()}
            sub="aspirational, pre-RFQ"
          />
          <SummaryCard
            icon={<Users className="h-4 w-4" />}
            label="Designers signalling"
            value={stats.uniqueDesigners.toString()}
            sub="across heritages and regions"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-charcoal-400">Filter:</span>
          <FilterStrip
            label="Heritage"
            options={heritageOptions}
            value={heritageFilter}
            onChange={(v) => setHeritageFilter(v as Heritage | "all")}
          />
          <FilterStrip
            label="Region"
            options={regionOptions}
            value={regionFilter}
            onChange={(v) => setRegionFilter(v as NigerianHub | "all")}
          />
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Panel
          icon={<TrendingUp className="h-4 w-4" />}
          title="Heritage demand"
          subtitle="Where the volume is concentrated"
        >
          {stats.byHeritage.length === 0 ? (
            <Empty />
          ) : (
            <ul className="space-y-3">
              {stats.byHeritage.map((h) => (
                <HeritageRow
                  key={h.heritage}
                  stat={h}
                  max={stats.byHeritage[0]?.yards ?? 1}
                />
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          icon={<MapPin className="h-4 w-4" />}
          title="Region demand"
          subtitle="Hubs designers want to source from"
        >
          {stats.byRegion.length === 0 ? (
            <Empty />
          ) : (
            <ul className="space-y-3">
              {stats.byRegion.map((r) => (
                <RegionRow
                  key={r.region}
                  stat={r}
                  max={stats.byRegion[0]?.yards ?? 1}
                />
              ))}
            </ul>
          )}
        </Panel>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Panel
          icon={<Sparkles className="h-4 w-4" />}
          title="Trending palette"
          subtitle="Weighted by yards demanded"
        >
          {stats.trendingPalette.length === 0 ? (
            <Empty />
          ) : (
            <div className="flex flex-wrap gap-2.5">
              {stats.trendingPalette.map((p) => (
                <div
                  key={p.hex}
                  className="group relative flex items-center gap-2 rounded-full border border-charcoal-100 bg-white pl-1 pr-3 py-1 text-xs shadow-soft"
                >
                  <span
                    className="h-6 w-6 rounded-full ring-1 ring-charcoal-100"
                    style={{ backgroundColor: p.hex }}
                    aria-hidden
                  />
                  <span className="font-mono uppercase text-charcoal-700">
                    {p.hex}
                  </span>
                  <span className="text-charcoal-400">· {p.weight}yd</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-5 border-t border-charcoal-100 pt-4">
            <p className="label">Trending moods</p>
            {stats.trendingMoods.length === 0 ? (
              <Empty />
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {stats.trendingMoods.map((m) => (
                  <span key={m.tag} className="pill">
                    {m.tag}
                    <span className="text-charcoal-400">· {m.count}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </Panel>

        <Panel
          icon={<Boxes className="h-4 w-4" />}
          title="Fabric-level demand"
          subtitle="Plan a run for these first"
        >
          {stats.byFabric.length === 0 ? (
            <Empty />
          ) : (
            <ul className="divide-y divide-charcoal-100">
              {stats.byFabric.slice(0, 8).map((f) => (
                <FabricRow key={f.fabricId} stat={f} />
              ))}
            </ul>
          )}
        </Panel>
      </section>

      <section>
        <Panel
          icon={<BellRing className="h-4 w-4" />}
          title="Recent interest signals"
          subtitle={`Latest ${Math.min(filteredFeed.length, 24)} of ${stats.totalInterests}`}
        >
          {filteredFeed.length === 0 ? (
            <Empty />
          ) : (
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {filteredFeed.slice(0, 24).map((item) => (
                <FeedRow key={item.id} item={item} />
              ))}
            </ul>
          )}
        </Panel>
      </section>
    </div>
  );
}

function Panel({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card flex flex-col gap-4 p-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-charcoal-900">
            <span className="text-terracotta-600">{icon}</span>
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-charcoal-400">{subtitle}</p>
          )}
        </div>
      </header>
      {children}
    </section>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="card flex flex-col gap-1.5 p-5">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-charcoal-400">
        <span className="text-terracotta-600">{icon}</span>
        {label}
      </div>
      <p className="font-display text-3xl font-semibold leading-none text-charcoal-900">
        {value}
      </p>
      <p className="text-[11px] text-charcoal-400">{sub}</p>
    </div>
  );
}

function FilterStrip<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="mr-1 text-charcoal-400">{label}</span>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "rounded-full px-2.5 py-1 font-medium transition",
            value === opt
              ? "bg-charcoal-900 text-cream-50"
              : "bg-white text-charcoal-700 ring-1 ring-charcoal-100 hover:bg-cream-100",
          )}
        >
          {opt === "all" ? "All" : opt}
        </button>
      ))}
    </div>
  );
}

function HeritageRow({
  stat,
  max,
}: {
  stat: DemandHeritageStat;
  max: number;
}) {
  const pct = Math.max(6, Math.round((stat.yards / max) * 100));
  return (
    <li className="flex items-center gap-3">
      <div className="w-24 flex-none">
        <HeritageBadge heritage={stat.heritage} />
      </div>
      <div className="flex-1">
        <div className="h-2 w-full overflow-hidden rounded-full bg-cream-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-terracotta-500 to-terracotta-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="w-32 flex-none text-right text-xs text-charcoal-700">
        <span className="font-medium text-charcoal-900">{stat.yards}</span>{" "}
        yds ·{" "}
        <span className="text-charcoal-400">
          {stat.interests} {stat.interests === 1 ? "signal" : "signals"}
        </span>
      </div>
    </li>
  );
}

function RegionRow({ stat, max }: { stat: DemandRegionStat; max: number }) {
  const pct = Math.max(6, Math.round((stat.yards / max) * 100));
  return (
    <li className="flex items-center gap-3">
      <div className="w-24 flex-none text-sm font-medium text-charcoal-900">
        {stat.region}
      </div>
      <div className="flex-1">
        <div className="h-2 w-full overflow-hidden rounded-full bg-cream-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-800"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="w-32 flex-none text-right text-xs text-charcoal-700">
        <span className="font-medium text-charcoal-900">{stat.yards}</span>{" "}
        yds ·{" "}
        <span className="text-charcoal-400">
          {stat.interests} {stat.interests === 1 ? "signal" : "signals"}
        </span>
      </div>
    </li>
  );
}

function FabricRow({ stat }: { stat: DemandFabricStat }) {
  const shortfall = stat.shortfall > 0;
  return (
    <li className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
      <div
        className="h-12 w-12 flex-none rounded-xl ring-1 ring-charcoal-100"
        style={{
          background: `linear-gradient(135deg, ${stat.palette[0] ?? "#1F2854"} 0%, ${
            stat.palette[2] ?? stat.palette[1] ?? "#FBF7F1"
          } 100%)`,
        }}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link
            href={`/fabrics/${stat.fabricId}`}
            className="truncate font-medium text-charcoal-900 hover:underline"
          >
            {stat.fabricName}
          </Link>
          {shortfall && (
            <span className="inline-flex items-center gap-1 rounded-full bg-terracotta-50 px-2 py-0.5 text-[10px] font-medium text-terracotta-700">
              <AlertTriangle className="h-3 w-3" /> Shortfall
            </span>
          )}
        </div>
        <p className="truncate text-xs text-charcoal-400">
          {stat.supplierName} · {stat.region} · {stat.heritage}
          {stat.earliestDeadline &&
            ` · earliest needed ${formatShort(stat.earliestDeadline)}`}
        </p>
      </div>
      <div className="flex-none text-right">
        <p className="text-sm font-medium text-charcoal-900">
          {stat.yards}{" "}
          <span className="text-xs font-normal text-charcoal-400">yds</span>
        </p>
        <p className="text-[11px] text-charcoal-400">
          {stat.interests} {stat.interests === 1 ? "designer" : "designers"} ·
          stock {stat.inStockYards}
        </p>
      </div>
      <Link
        href={`/fabrics/${stat.fabricId}`}
        className="hidden flex-none text-charcoal-400 transition hover:text-charcoal-900 sm:block"
        aria-label={`Open ${stat.fabricName}`}
      >
        <ArrowUpRight className="h-4 w-4" />
      </Link>
    </li>
  );
}

function FeedRow({ item }: { item: DemandFeedItem }) {
  return (
    <li className="flex items-start gap-3 rounded-2xl border border-charcoal-100 bg-white p-3">
      <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-cream-100 font-display text-xs font-medium text-charcoal-700">
        {item.designerInitials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-charcoal-900">
          <span className="text-charcoal-400">A designer wants</span>{" "}
          <span className="font-medium">{item.yards} yd</span>{" "}
          <span className="text-charcoal-400">of</span>{" "}
          <Link
            href={`/fabrics/${item.fabricId}`}
            className="font-medium hover:underline"
          >
            {item.fabricName}
          </Link>
        </p>
        <p className="mt-0.5 truncate text-[11px] text-charcoal-400">
          {item.heritage} · {item.region} · needed {formatShort(item.neededBy)}{" "}
          · {timeAgo(item.createdAt)}
        </p>
      </div>
    </li>
  );
}

function Empty() {
  return (
    <p className="text-xs text-charcoal-400">
      No signals match this filter yet.
    </p>
  );
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function formatShort(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function computeStats(feed: DemandFeedItem[]): ComputedStats {
  const heritageMap = new Map<Heritage, DemandHeritageStat>();
  const heritageDesigners = new Map<Heritage, Set<string>>();
  const regionMap = new Map<NigerianHub, DemandRegionStat>();
  const fabricMap = new Map<string, DemandFabricStat>();
  const moodMap = new Map<string, number>();
  const paletteMap = new Map<string, number>();
  const designers = new Set<string>();
  let totalYards = 0;

  for (const i of feed) {
    designers.add(i.designerEmail.toLowerCase());
    totalYards += i.yards;

    const h = heritageMap.get(i.heritage) ?? {
      heritage: i.heritage,
      interests: 0,
      yards: 0,
      designers: 0,
    };
    h.interests += 1;
    h.yards += i.yards;
    heritageMap.set(i.heritage, h);
    if (!heritageDesigners.has(i.heritage)) {
      heritageDesigners.set(i.heritage, new Set());
    }
    heritageDesigners.get(i.heritage)!.add(i.designerEmail.toLowerCase());

    const r = regionMap.get(i.region) ?? {
      region: i.region,
      interests: 0,
      yards: 0,
    };
    r.interests += 1;
    r.yards += i.yards;
    regionMap.set(i.region, r);

    const f = fabricMap.get(i.fabricId) ?? {
      fabricId: i.fabricId,
      fabricName: i.fabricName,
      supplierId: i.supplierId,
      supplierName: i.supplierName,
      heritage: i.heritage,
      region: i.region,
      palette: i.palette,
      inStockYards: i.inStockYards,
      minOrderYards: i.minOrderYards,
      interests: 0,
      yards: 0,
      earliestDeadline: null as string | null,
      shortfall: 0,
    };
    f.interests += 1;
    f.yards += i.yards;
    if (
      f.earliestDeadline === null ||
      new Date(i.neededBy).getTime() < new Date(f.earliestDeadline).getTime()
    ) {
      f.earliestDeadline = i.neededBy;
    }
    fabricMap.set(i.fabricId, f);

    for (const tag of i.moodTags) {
      moodMap.set(tag, (moodMap.get(tag) ?? 0) + 1);
    }
    i.palette.slice(0, 3).forEach((hex, idx) => {
      const weight = i.yards * (1 - idx * 0.25);
      paletteMap.set(hex, (paletteMap.get(hex) ?? 0) + weight);
    });
  }

  for (const [heritage, set] of heritageDesigners) {
    const stat = heritageMap.get(heritage);
    if (stat) stat.designers = set.size;
  }

  const byFabric = Array.from(fabricMap.values())
    .map((f) => ({ ...f, shortfall: Math.max(0, f.yards - f.inStockYards) }))
    .sort((a, b) => b.interests - a.interests || b.yards - a.yards);

  return {
    totalInterests: feed.length,
    totalYards,
    uniqueDesigners: designers.size,
    byHeritage: Array.from(heritageMap.values()).sort(
      (a, b) => b.interests - a.interests,
    ),
    byRegion: Array.from(regionMap.values()).sort(
      (a, b) => b.interests - a.interests,
    ),
    byFabric,
    trendingMoods: Array.from(moodMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    trendingPalette: Array.from(paletteMap.entries())
      .map(([hex, weight]) => ({ hex, weight: Math.round(weight) }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 12),
  };
}

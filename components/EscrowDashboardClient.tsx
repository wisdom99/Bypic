"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Coins,
  Lock,
  PiggyBank,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  STATUS_LABEL,
  TOTAL_FEE_RATE,
  TRANSACTION_FEE_RATE,
  ESCROW_FEE_RATE,
} from "@/lib/escrow";
import type {
  EscrowOrder,
  EscrowRevenueStats,
  EscrowStatus,
} from "@/lib/types";
import { cn, formatNaira } from "@/lib/utils";
import { EscrowBadge } from "./EscrowBadge";
import { PaletteSwatches } from "./PaletteSwatches";

const FILTERS: Array<{ key: "all" | EscrowStatus; label: string }> = [
  { key: "all", label: "All" },
  { key: "pending", label: "Awaiting payment" },
  { key: "funded", label: "In escrow" },
  { key: "shipped", label: "In transit" },
  { key: "delivered", label: "Delivered" },
  { key: "released", label: "Released" },
  { key: "disputed", label: "Disputed" },
];

export function EscrowDashboardClient({
  orders,
  stats,
}: {
  orders: EscrowOrder[];
  stats: EscrowRevenueStats;
}) {
  const [filter, setFilter] = useState<"all" | EscrowStatus>("all");
  const filtered = useMemo(
    () => (filter === "all" ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter],
  );

  return (
    <div className="container-page py-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-terracotta-600">
            Escrow ledger
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-charcoal-900 md:text-5xl">
            Trust, priced in.
          </h1>
          <p className="mt-3 max-w-2xl text-base text-charcoal-400">
            Every Threadline order moves through escrow. Designers fund the
            order, producers ship, and funds release on confirmation. We
            charge {(TOTAL_FEE_RATE * 100).toFixed(1)}% on every transaction —
            that&apos;s how we underwrite buyer protection and how the
            platform earns.
          </p>
        </div>
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-xs text-indigo-700">
          <p className="font-semibold uppercase tracking-wider">
            Fee structure
          </p>
          <p className="mt-1 text-charcoal-700">
            <span className="font-mono">
              {(TRANSACTION_FEE_RATE * 100).toFixed(1)}%
            </span>{" "}
            transaction +{" "}
            <span className="font-mono">
              {(ESCROW_FEE_RATE * 100).toFixed(1)}%
            </span>{" "}
            escrow ={" "}
            <span className="font-mono font-semibold">
              {(TOTAL_FEE_RATE * 100).toFixed(1)}%
            </span>{" "}
            buyer-side
          </p>
        </div>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <RevenueTile
          icon={<Lock className="h-4 w-4" />}
          label="Funds held in escrow"
          value={formatNaira(stats.fundsHeldNgn)}
          subline={`${stats.countByStatus.funded + stats.countByStatus.shipped + stats.countByStatus.delivered + stats.countByStatus.disputed} active orders`}
          tone="indigo"
        />
        <RevenueTile
          icon={<Truck className="h-4 w-4" />}
          label="Paid out to producers"
          value={formatNaira(stats.paidOutNgn)}
          subline={`${stats.countByStatus.released} released orders`}
          tone="cream"
        />
        <RevenueTile
          icon={<Coins className="h-4 w-4" />}
          label="Threadline revenue"
          value={formatNaira(stats.platformRevenueNgn)}
          subline={`${(TOTAL_FEE_RATE * 100).toFixed(1)}% on released volume`}
          tone="emerald"
        />
        <RevenueTile
          icon={<PiggyBank className="h-4 w-4" />}
          label="Pipeline revenue"
          value={formatNaira(stats.pipelineRevenueNgn)}
          subline="Locked in, not yet realised"
          tone="terracotta"
        />
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-3">
        <Pillar
          step="1"
          icon={<Lock className="h-4 w-4" />}
          title="Sourcing trust"
          body="Buyers know the producer is verified and the funds won't move until they sign off. No more 'pay 50% upfront, hope for the best'."
        />
        <Pillar
          step="2"
          icon={<Truck className="h-4 w-4" />}
          title="Selling certainty"
          body="Producers see the funds are real before they cut. They get paid on confirmation — no chargebacks, no chasing invoices."
        />
        <Pillar
          step="3"
          icon={<ShieldCheck className="h-4 w-4" />}
          title="Platform protection"
          body="Threadline mediates disputes, refunds the buyer if the fabric doesn't match, and keeps a 4% take to underwrite the guarantee."
        />
      </section>

      <section className="mt-12">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="font-display text-2xl font-semibold text-charcoal-900">
            Order ledger
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => {
              const active = filter === f.key;
              const count =
                f.key === "all"
                  ? orders.length
                  : (stats.countByStatus[f.key as EscrowStatus] ?? 0);
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    active
                      ? "border-charcoal-900 bg-charcoal-900 text-cream-50"
                      : "border-charcoal-100 bg-white text-charcoal-700 hover:border-charcoal-700/40",
                  )}
                >
                  {f.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-[10px]",
                      active
                        ? "bg-cream-50/20 text-cream-50"
                        : "bg-cream-100 text-charcoal-400",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-3xl border border-charcoal-100 bg-white shadow-soft">
          <table className="w-full text-left text-sm">
            <thead className="bg-cream-100 text-[11px] uppercase tracking-wider text-charcoal-400">
              <tr>
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Designer</th>
                <th className="hidden px-5 py-3 md:table-cell">Producer</th>
                <th className="px-5 py-3 text-right">Subtotal</th>
                <th className="hidden px-5 py-3 text-right md:table-cell">
                  Fees ({(TOTAL_FEE_RATE * 100).toFixed(1)}%)
                </th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-100">
              {filtered.map((o, idx) => (
                <motion.tr
                  key={o.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.02 }}
                  className="hover:bg-cream-100/40"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <PaletteSwatches palette={o.palette} size="sm" />
                      <div>
                        <p className="font-mono text-[11px] text-charcoal-400">
                          {o.id}
                        </p>
                        <p className="font-medium text-charcoal-900">
                          {o.fabricName}
                        </p>
                        <p className="text-xs text-charcoal-400">
                          {o.yards} yards · {o.heritage}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-charcoal-900">
                      {o.designerName}
                    </p>
                    <p className="text-xs text-charcoal-400">
                      {o.designerEmail}
                    </p>
                  </td>
                  <td className="hidden px-5 py-4 md:table-cell">
                    <p className="font-medium text-charcoal-900">
                      {o.supplierName}
                    </p>
                    <p className="text-xs text-charcoal-400">{o.region}</p>
                  </td>
                  <td className="px-5 py-4 text-right font-mono text-sm text-charcoal-900">
                    {formatNaira(o.fees.subtotalNgn)}
                  </td>
                  <td className="hidden px-5 py-4 text-right font-mono text-xs text-indigo-700 md:table-cell">
                    {formatNaira(o.fees.totalFeeNgn)}
                  </td>
                  <td className="px-5 py-4">
                    <EscrowBadge status={o.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/escrow/${o.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 hover:text-indigo-800"
                    >
                      Open
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-sm text-charcoal-400"
                  >
                    No orders matching{" "}
                    <span className="font-medium">
                      {filter === "all"
                        ? "any status"
                        : STATUS_LABEL[filter as EscrowStatus]}
                    </span>
                    .
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function RevenueTile({
  icon,
  label,
  value,
  subline,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subline: string;
  tone: "indigo" | "emerald" | "terracotta" | "cream";
}) {
  const toneClass =
    tone === "indigo"
      ? "border-indigo-100 bg-indigo-50/60 text-indigo-700"
      : tone === "emerald"
        ? "border-emerald-100 bg-emerald-50/60 text-emerald-700"
        : tone === "terracotta"
          ? "border-terracotta-100 bg-terracotta-50/60 text-terracotta-700"
          : "border-charcoal-100 bg-cream-100/60 text-charcoal-700";
  return (
    <div className={cn("rounded-2xl border p-4 shadow-soft", toneClass)}>
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-[11px] font-medium uppercase tracking-wider">
          {label}
        </p>
      </div>
      <p className="mt-3 font-display text-2xl font-semibold text-charcoal-900">
        {value}
      </p>
      <p className="mt-1 text-xs text-charcoal-400">{subline}</p>
    </div>
  );
}

function Pillar({
  step,
  icon,
  title,
  body,
}: {
  step: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 text-indigo-700">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-charcoal-400">
          0{step}
        </span>
        {icon}
      </div>
      <h3 className="mt-2 font-display text-lg font-semibold text-charcoal-900">
        {title}
      </h3>
      <p className="mt-1 text-sm text-charcoal-400">{body}</p>
    </div>
  );
}

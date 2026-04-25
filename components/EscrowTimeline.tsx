import { Check, AlertTriangle, Clock } from "lucide-react";
import { TIMELINE_STEPS, statusIndex } from "@/lib/escrow";
import type { EscrowOrder } from "@/lib/types";
import { cn } from "@/lib/utils";

export function EscrowTimeline({ order }: { order: EscrowOrder }) {
  const isDisputed = order.status === "disputed";
  const isRefunded = order.status === "refunded";
  const isCancelled = order.status === "cancelled";

  // Determine "current" position. Disputed orders pin progress at the last
  // step they reached; refunded/cancelled show as a separate failure state.
  const lastReachedStatus = (() => {
    if (order.releasedAt) return "released" as const;
    if (order.deliveredAt) return "delivered" as const;
    if (order.shippedAt) return "shipped" as const;
    if (order.fundedAt) return "funded" as const;
    return "pending" as const;
  })();
  const reachedIdx = statusIndex(lastReachedStatus);

  return (
    <div className="space-y-4">
      <ol className="relative space-y-6 border-l border-charcoal-100 pl-6">
        {TIMELINE_STEPS.map((step, idx) => {
          const reached = idx <= reachedIdx && !isCancelled && !isRefunded;
          const current = idx === reachedIdx && order.status === step.status;
          const stamp = stampFor(order, step.status);
          return (
            <li key={step.status} className="relative">
              <span
                className={cn(
                  "absolute -left-[33px] flex h-6 w-6 items-center justify-center rounded-full border-2 bg-cream-50",
                  reached
                    ? "border-indigo-700 text-indigo-700"
                    : "border-charcoal-100 text-charcoal-400",
                  current && "ring-4 ring-indigo-100",
                )}
              >
                {reached ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <span className="block h-1.5 w-1.5 rounded-full bg-charcoal-100" />
                )}
              </span>
              <p
                className={cn(
                  "font-display text-sm font-semibold",
                  reached ? "text-charcoal-900" : "text-charcoal-400",
                )}
              >
                {step.title}
              </p>
              <p className="mt-0.5 text-xs text-charcoal-400">
                {step.description}
              </p>
              {stamp && (
                <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-charcoal-400">
                  <Clock className="h-3 w-3" />
                  {stamp}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {(isDisputed || isRefunded || isCancelled) && (
        <div
          className={cn(
            "flex items-start gap-2 rounded-2xl border px-4 py-3 text-xs",
            isDisputed
              ? "border-terracotta-100 bg-terracotta-50 text-terracotta-700"
              : "border-charcoal-100 bg-cream-100 text-charcoal-700",
          )}
        >
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-none" />
          <div>
            <p className="font-medium">
              {isDisputed && "Dispute open — Threadline is mediating."}
              {isRefunded && "Order refunded — funds returned to the designer."}
              {isCancelled && "Order cancelled before funding."}
            </p>
            {order.disputeReason && isDisputed && (
              <p className="mt-1 text-charcoal-700/90">{order.disputeReason}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function stampFor(
  order: EscrowOrder,
  status: (typeof TIMELINE_STEPS)[number]["status"],
): string | null {
  const map: Partial<Record<typeof status, string | undefined>> = {
    pending: order.createdAt,
    funded: order.fundedAt,
    shipped: order.shippedAt,
    delivered: order.deliveredAt,
    released: order.releasedAt,
  };
  const iso = map[status];
  if (!iso) return null;
  return formatRelative(iso);
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = now - then;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
  });
}

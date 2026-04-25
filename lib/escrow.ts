import type {
  EscrowFeeBreakdown,
  EscrowOrder,
  EscrowStatus,
} from "@/lib/types";

// Fee rates are tuned to be transparent to designers and producers and to
// match common marketplace economics (Stripe Connect, Escrow.com).
//
//   Transaction fee  → covers payment rails + ops              (2.5%)
//   Escrow fee       → underwrites buyer protection / disputes (1.5%)
//   Total platform take                                        (4.0%)
//
// The buyer pays subtotal + 4%. The producer receives the full subtotal
// once funds are released. Threadline keeps the 4% as revenue on every
// released transaction.
export const TRANSACTION_FEE_RATE = 0.025;
export const ESCROW_FEE_RATE = 0.015;
export const TOTAL_FEE_RATE = TRANSACTION_FEE_RATE + ESCROW_FEE_RATE;

// Naira is unit-less in our prototype, so we round to whole units.
function roundNgn(n: number): number {
  return Math.round(n);
}

export function computeFees(
  yards: number,
  pricePerYardNgn: number,
): EscrowFeeBreakdown {
  const subtotalNgn = roundNgn(yards * pricePerYardNgn);
  const transactionFeeNgn = roundNgn(subtotalNgn * TRANSACTION_FEE_RATE);
  const escrowFeeNgn = roundNgn(subtotalNgn * ESCROW_FEE_RATE);
  const totalFeeNgn = transactionFeeNgn + escrowFeeNgn;
  return {
    subtotalNgn,
    transactionFeeNgn,
    escrowFeeNgn,
    totalFeeNgn,
    totalChargedNgn: subtotalNgn + totalFeeNgn,
    producerPayoutNgn: subtotalNgn,
    transactionFeeRate: TRANSACTION_FEE_RATE,
    escrowFeeRate: ESCROW_FEE_RATE,
  };
}

// State transition rules. Keep the matrix small and explicit so the API
// can validate every move and produce sensible errors. `system` covers
// auto-release timers; `threadline` covers manual mediator actions.
const TRANSITIONS: Record<EscrowStatus, EscrowStatus[]> = {
  pending: ["funded", "cancelled"],
  funded: ["shipped", "refunded", "disputed"],
  shipped: ["delivered", "disputed"],
  delivered: ["released", "disputed"],
  disputed: ["released", "refunded"],
  released: [],
  refunded: [],
  cancelled: [],
};

export function canTransition(
  from: EscrowStatus,
  to: EscrowStatus,
): boolean {
  return TRANSITIONS[from].includes(to);
}

export function isTerminal(status: EscrowStatus): boolean {
  return TRANSITIONS[status].length === 0;
}

export const STATUS_LABEL: Record<EscrowStatus, string> = {
  pending: "Awaiting payment",
  funded: "In escrow",
  shipped: "In transit",
  delivered: "Delivered",
  released: "Released to producer",
  disputed: "Under review",
  refunded: "Refunded",
  cancelled: "Cancelled",
};

export const STATUS_BLURB: Record<EscrowStatus, string> = {
  pending: "Designer hasn't funded the order yet.",
  funded: "Threadline is holding the funds. Producer to ship.",
  shipped: "Producer has dispatched the fabric. Awaiting delivery confirmation.",
  delivered: "Designer confirmed receipt. Funds release after the inspection window.",
  released: "Funds have been paid out to the producer.",
  disputed: "A dispute is open. Threadline is mediating.",
  refunded: "Funds returned to the designer.",
  cancelled: "Order was cancelled before funding.",
};

export const STATUS_TONE: Record<EscrowStatus, string> = {
  pending: "bg-cream-200 text-charcoal-700",
  funded: "bg-indigo-50 text-indigo-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-cream-200 text-indigo-800",
  released: "bg-emerald-50 text-emerald-700",
  disputed: "bg-terracotta-50 text-terracotta-700",
  refunded: "bg-charcoal-100 text-charcoal-700",
  cancelled: "bg-charcoal-100 text-charcoal-400",
};

// Ordered list of milestones we render in the timeline. We don't include
// terminal failure states here; those are surfaced separately.
export const TIMELINE_STEPS: Array<{
  status: EscrowStatus;
  title: string;
  description: string;
}> = [
  {
    status: "pending",
    title: "Order placed",
    description: "Designer drafts the secure order and sees the price + protection fee.",
  },
  {
    status: "funded",
    title: "Funds in escrow",
    description: "Designer pays. Threadline holds the funds — producer cannot withdraw yet.",
  },
  {
    status: "shipped",
    title: "Producer ships",
    description: "Producer marks the order shipped with a tracking reference.",
  },
  {
    status: "delivered",
    title: "Designer confirms",
    description: "Designer inspects the fabric and confirms receipt.",
  },
  {
    status: "released",
    title: "Funds released",
    description: "Producer is paid out, minus Threadline's 4% protection fee.",
  },
];

export function statusIndex(status: EscrowStatus): number {
  const idx = TIMELINE_STEPS.findIndex((s) => s.status === status);
  return idx === -1 ? -1 : idx;
}

// 7-day inspection window before automatic release on delivered orders.
export const AUTO_RELEASE_WINDOW_HOURS = 24 * 7;

export function autoReleaseAtFrom(deliveredAt: Date): string {
  const d = new Date(deliveredAt);
  d.setHours(d.getHours() + AUTO_RELEASE_WINDOW_HOURS);
  return d.toISOString();
}

// Helper used by the dashboard to colour-code revenue lines.
export function isRealised(status: EscrowStatus): boolean {
  return status === "released";
}

export function isPipeline(status: EscrowStatus): boolean {
  return (
    status === "funded" ||
    status === "shipped" ||
    status === "delivered" ||
    status === "disputed"
  );
}

export function generateOrderId(): string {
  return `ESC-${Date.now().toString(36).toUpperCase()}-${Math.floor(
    Math.random() * 9999,
  )
    .toString()
    .padStart(4, "0")}`;
}

export function summarizeOrder(order: EscrowOrder): string {
  const yards = `${order.yards} yds`;
  return `${order.fabricName} · ${yards} · ${STATUS_LABEL[order.status]}`;
}

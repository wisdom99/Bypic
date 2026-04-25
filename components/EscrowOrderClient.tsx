"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Lock,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import {
  STATUS_BLURB,
  STATUS_LABEL,
  TOTAL_FEE_RATE,
} from "@/lib/escrow";
import type { EscrowOrder, EscrowStatus } from "@/lib/types";
import { cn, formatNaira } from "@/lib/utils";
import { EscrowBadge } from "./EscrowBadge";
import { EscrowTimeline } from "./EscrowTimeline";

export function EscrowOrderClient({ initial }: { initial: EscrowOrder }) {
  const router = useRouter();
  const [order, setOrder] = useState<EscrowOrder>(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Action panels — collapsible inputs for the next allowed transitions.
  const [openShip, setOpenShip] = useState(false);
  const [trackingRef, setTrackingRef] = useState("");
  const [shippingNote, setShippingNote] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [openDispute, setOpenDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");

  const transition = async (
    payload: {
      to: EscrowStatus;
      actor: "designer" | "producer" | "threadline" | "system";
      note?: string;
      trackingRef?: string;
      shippingNote?: string;
      deliveryNote?: string;
      disputeReason?: string;
    },
  ) => {
    setBusy(payload.to);
    setError(null);
    try {
      const res = await fetch(`/api/escrow/${order.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setOrder(data.order);
      setOpenShip(false);
      setOpenConfirm(false);
      setOpenDispute(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="container-page py-10">
      <Link
        href="/escrow"
        className="inline-flex items-center gap-1.5 text-sm text-charcoal-400 transition hover:text-charcoal-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to escrow ledger
      </Link>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-charcoal-400">
            {order.id}
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold leading-tight text-charcoal-900 md:text-4xl">
            {order.fabricName}
          </h1>
          <p className="mt-1 text-sm text-charcoal-400">
            {order.yards} yards · {order.heritage} · {order.region} · for{" "}
            <span className="text-charcoal-700">{order.designerName}</span>
          </p>
        </div>
        <EscrowBadge status={order.status} className="self-start text-xs" />
      </div>

      <div className="mt-3 rounded-2xl border border-indigo-100 bg-indigo-50/40 px-4 py-3 text-sm text-indigo-700">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 flex-none" />
          <p>{STATUS_BLURB[order.status]}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-display text-lg font-semibold text-charcoal-900">
              Progress
            </h2>
            <p className="mt-1 text-xs text-charcoal-400">
              Each step is recorded on the escrow ledger. Funds only move on
              the final release.
            </p>
            <div className="mt-5">
              <EscrowTimeline order={order} />
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-display text-lg font-semibold text-charcoal-900">
              Activity
            </h2>
            <ul className="mt-4 space-y-3">
              {order.events
                .slice()
                .reverse()
                .map((ev, idx) => (
                  <li
                    key={`${ev.at}-${idx}`}
                    className="rounded-xl border border-charcoal-100 bg-white px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs">
                        <EscrowBadge status={ev.status} />
                        <span className="text-charcoal-400">·</span>
                        <span className="text-charcoal-700">
                          by {actorLabel(ev.actor)}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-charcoal-400">
                        {new Date(ev.at).toLocaleString("en-NG", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                    {ev.note && (
                      <p className="mt-1.5 text-sm text-charcoal-700">
                        {ev.note}
                      </p>
                    )}
                  </li>
                ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-display text-lg font-semibold text-charcoal-900">
              Order summary
            </h2>
            <dl className="mt-4 space-y-2 text-sm">
              <Row
                label={`${order.yards} yards × ${formatNaira(order.pricePerYardNgn)}`}
                value={formatNaira(order.fees.subtotalNgn)}
              />
              <Row
                label={`Transaction fee · ${(order.fees.transactionFeeRate * 100).toFixed(1)}%`}
                value={formatNaira(order.fees.transactionFeeNgn)}
                muted
              />
              <Row
                label={`Escrow protection · ${(order.fees.escrowFeeRate * 100).toFixed(1)}%`}
                value={formatNaira(order.fees.escrowFeeNgn)}
                muted
              />
              <div className="my-1 border-t border-charcoal-100" />
              <Row
                label="Designer paid into escrow"
                value={formatNaira(order.fees.totalChargedNgn)}
                strong
              />
              <Row
                label={`Producer payout · ${order.supplierName}`}
                value={formatNaira(order.fees.producerPayoutNgn)}
              />
              <Row
                label="Threadline take"
                value={formatNaira(order.fees.totalFeeNgn)}
                muted
              />
            </dl>

            {order.trackingRef && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-charcoal-100 bg-cream-100/60 px-3 py-2 text-xs text-charcoal-700">
                <Truck className="h-3.5 w-3.5 text-indigo-700" />
                <span className="font-mono">{order.trackingRef}</span>
                {order.shippingNote && (
                  <span className="text-charcoal-400">
                    · {order.shippingNote}
                  </span>
                )}
              </div>
            )}

            {order.autoReleaseAt && order.status === "delivered" && (
              <p className="mt-3 text-[11px] text-charcoal-400">
                Auto-release on{" "}
                <span className="font-mono text-charcoal-700">
                  {new Date(order.autoReleaseAt).toLocaleString("en-NG", {
                    dateStyle: "medium",
                  })}
                </span>{" "}
                if no dispute is raised.
              </p>
            )}
          </div>

          <div className="card p-6">
            <h2 className="font-display text-lg font-semibold text-charcoal-900">
              Actions
            </h2>
            <p className="mt-1 text-xs text-charcoal-400">
              Mock the next step in the lifecycle. In production these are
              role-gated to the designer or producer.
            </p>
            <div className="mt-4 space-y-2">
              {order.status === "pending" && (
                <>
                  <ActionButton
                    icon={<Lock className="h-4 w-4" />}
                    label={`Fund ${formatNaira(order.fees.totalChargedNgn)} into escrow`}
                    busy={busy === "funded"}
                    onClick={() =>
                      transition({
                        to: "funded",
                        actor: "designer",
                        note: "Designer funded escrow.",
                      })
                    }
                  />
                  <ActionButton
                    icon={<RefreshCw className="h-4 w-4" />}
                    label="Cancel order"
                    variant="ghost"
                    busy={busy === "cancelled"}
                    onClick={() =>
                      transition({
                        to: "cancelled",
                        actor: "designer",
                        note: "Designer cancelled before funding.",
                      })
                    }
                  />
                </>
              )}

              {order.status === "funded" && (
                <>
                  {!openShip ? (
                    <ActionButton
                      icon={<Truck className="h-4 w-4" />}
                      label="Mark shipped (producer)"
                      onClick={() => setOpenShip(true)}
                    />
                  ) : (
                    <Inline
                      title="Mark shipped"
                      onCancel={() => setOpenShip(false)}
                      onSubmit={() =>
                        transition({
                          to: "shipped",
                          actor: "producer",
                          trackingRef:
                            trackingRef.trim() || "TRK-AUTO-DEMO",
                          shippingNote:
                            shippingNote.trim() ||
                            "Producer dispatched the cut.",
                          note: "Producer marked the order shipped.",
                        })
                      }
                      submitLabel={
                        busy === "shipped" ? "Marking…" : "Confirm shipment"
                      }
                      submitDisabled={busy === "shipped"}
                    >
                      <input
                        className="input"
                        placeholder="Tracking ref · e.g. GIG-LOS-90112"
                        value={trackingRef}
                        onChange={(e) => setTrackingRef(e.target.value)}
                      />
                      <input
                        className="input"
                        placeholder="Shipping note (optional)"
                        value={shippingNote}
                        onChange={(e) => setShippingNote(e.target.value)}
                      />
                    </Inline>
                  )}
                  <ActionButton
                    icon={<AlertTriangle className="h-4 w-4" />}
                    label="Refund (Threadline mediator)"
                    variant="ghost"
                    busy={busy === "refunded"}
                    onClick={() =>
                      transition({
                        to: "refunded",
                        actor: "threadline",
                        note: "Mediator refunded buyer pre-shipment.",
                      })
                    }
                  />
                </>
              )}

              {order.status === "shipped" && (
                <>
                  {!openConfirm ? (
                    <ActionButton
                      icon={<PackageCheck className="h-4 w-4" />}
                      label="Confirm delivery (designer)"
                      onClick={() => setOpenConfirm(true)}
                    />
                  ) : (
                    <Inline
                      title="Confirm delivery"
                      onCancel={() => setOpenConfirm(false)}
                      onSubmit={() =>
                        transition({
                          to: "delivered",
                          actor: "designer",
                          deliveryNote:
                            deliveryNote.trim() ||
                            "Fabric received and inspected.",
                          note: "Designer confirmed receipt.",
                        })
                      }
                      submitLabel={
                        busy === "delivered" ? "Confirming…" : "Confirm delivery"
                      }
                      submitDisabled={busy === "delivered"}
                    >
                      <textarea
                        className="input min-h-[80px]"
                        placeholder="Inspection notes (optional)"
                        value={deliveryNote}
                        onChange={(e) => setDeliveryNote(e.target.value)}
                      />
                    </Inline>
                  )}
                  {!openDispute ? (
                    <ActionButton
                      icon={<AlertTriangle className="h-4 w-4" />}
                      label="Open dispute"
                      variant="ghost"
                      onClick={() => setOpenDispute(true)}
                    />
                  ) : (
                    <Inline
                      title="Open dispute"
                      onCancel={() => setOpenDispute(false)}
                      onSubmit={() =>
                        transition({
                          to: "disputed",
                          actor: "designer",
                          disputeReason:
                            disputeReason.trim() ||
                            "Designer raised a dispute.",
                          note: disputeReason.trim() || "Dispute opened.",
                        })
                      }
                      submitLabel={
                        busy === "disputed" ? "Opening…" : "Open dispute"
                      }
                      submitDisabled={busy === "disputed"}
                    >
                      <textarea
                        className="input min-h-[80px]"
                        placeholder="What's wrong? (mismatch, short cut, late, etc.)"
                        value={disputeReason}
                        onChange={(e) => setDisputeReason(e.target.value)}
                      />
                    </Inline>
                  )}
                </>
              )}

              {order.status === "delivered" && (
                <>
                  <ActionButton
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    label={`Release ${formatNaira(order.fees.producerPayoutNgn)} to producer`}
                    busy={busy === "released"}
                    onClick={() =>
                      transition({
                        to: "released",
                        actor: "designer",
                        note: `Designer released funds. Threadline kept ${formatNaira(order.fees.totalFeeNgn)} (${(TOTAL_FEE_RATE * 100).toFixed(1)}%).`,
                      })
                    }
                  />
                  {!openDispute ? (
                    <ActionButton
                      icon={<AlertTriangle className="h-4 w-4" />}
                      label="Open dispute instead"
                      variant="ghost"
                      onClick={() => setOpenDispute(true)}
                    />
                  ) : (
                    <Inline
                      title="Open dispute"
                      onCancel={() => setOpenDispute(false)}
                      onSubmit={() =>
                        transition({
                          to: "disputed",
                          actor: "designer",
                          disputeReason:
                            disputeReason.trim() ||
                            "Designer raised a dispute.",
                          note: disputeReason.trim() || "Dispute opened.",
                        })
                      }
                      submitLabel={
                        busy === "disputed" ? "Opening…" : "Open dispute"
                      }
                      submitDisabled={busy === "disputed"}
                    >
                      <textarea
                        className="input min-h-[80px]"
                        placeholder="What's wrong?"
                        value={disputeReason}
                        onChange={(e) => setDisputeReason(e.target.value)}
                      />
                    </Inline>
                  )}
                </>
              )}

              {order.status === "disputed" && (
                <>
                  <ActionButton
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    label="Resolve in producer's favour (release)"
                    busy={busy === "released"}
                    onClick={() =>
                      transition({
                        to: "released",
                        actor: "threadline",
                        note: "Threadline mediated — fabric matched listing.",
                      })
                    }
                  />
                  <ActionButton
                    icon={<RefreshCw className="h-4 w-4" />}
                    label="Resolve in designer's favour (refund)"
                    variant="ghost"
                    busy={busy === "refunded"}
                    onClick={() =>
                      transition({
                        to: "refunded",
                        actor: "threadline",
                        note: "Threadline refunded designer.",
                      })
                    }
                  />
                </>
              )}

              {(order.status === "released" ||
                order.status === "refunded" ||
                order.status === "cancelled") && (
                <p className="rounded-xl border border-charcoal-100 bg-cream-100/40 px-3 py-2 text-xs text-charcoal-400">
                  This order is closed. View the activity log for the full
                  history.
                </p>
              )}
            </div>

            {error && (
              <p className="mt-3 text-xs text-terracotta-700">⚠ {error}</p>
            )}
          </div>

          <Link
            href={`/fabrics/${order.fabricId}`}
            className="card flex items-center justify-between gap-3 p-5 transition hover:border-charcoal-700/30"
          >
            <div>
              <p className="text-xs text-charcoal-400">Listing</p>
              <p className="font-medium text-charcoal-900">
                {order.fabricName}
              </p>
              <p className="text-xs text-charcoal-400">
                {order.supplierName} · {order.region}
              </p>
            </div>
            <ArrowLeft className="h-4 w-4 rotate-180 text-charcoal-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function actorLabel(
  actor: "designer" | "producer" | "threadline" | "system",
): string {
  switch (actor) {
    case "designer":
      return "Designer";
    case "producer":
      return "Producer";
    case "threadline":
      return "Threadline mediator";
    case "system":
      return "Threadline (auto)";
  }
}

function Row({
  label,
  value,
  muted,
  strong,
}: {
  label: string;
  value: string;
  muted?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt
        className={
          muted
            ? "text-xs text-charcoal-400"
            : strong
              ? "text-sm font-medium text-charcoal-900"
              : "text-sm text-charcoal-700"
        }
      >
        {label}
      </dt>
      <dd
        className={
          muted
            ? "font-mono text-xs text-charcoal-400"
            : strong
              ? "font-mono text-sm font-semibold text-charcoal-900"
              : "font-mono text-sm text-charcoal-700"
        }
      >
        {value}
      </dd>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  busy,
  variant = "primary",
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  busy?: boolean;
  variant?: "primary" | "ghost";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary"
          ? "bg-indigo-700 text-cream-50 hover:bg-indigo-800"
          : "border border-charcoal-100 bg-white text-charcoal-700 hover:bg-cream-100",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function Inline({
  title,
  onCancel,
  onSubmit,
  submitLabel,
  submitDisabled,
  children,
}: {
  title: string;
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
  submitDisabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-charcoal-100 bg-cream-100/40 p-3">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-charcoal-400">
        {title}
      </p>
      <div className="space-y-2">{children}</div>
      <div className="mt-3 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn-ghost">
          Cancel
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitDisabled}
          className="btn-primary"
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

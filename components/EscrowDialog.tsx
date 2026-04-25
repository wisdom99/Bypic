"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AnimatePresence,
  motion,
  type HTMLMotionProps,
  type Variants,
} from "framer-motion";
import {
  CheckCircle2,
  Loader2,
  Lock,
  ShieldCheck,
  Truck,
  X,
} from "lucide-react";
import type { EscrowFeeBreakdown, Fabric, Supplier } from "@/lib/types";
import { computeFees, TOTAL_FEE_RATE } from "@/lib/escrow";
import { formatNaira } from "@/lib/utils";

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

const panelVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1 },
};

interface EscrowDialogProps {
  open: boolean;
  onClose: () => void;
  fabric: Fabric;
  supplier: Supplier;
}

export function EscrowDialog({
  open,
  onClose,
  fabric,
  supplier,
}: EscrowDialogProps) {
  const router = useRouter();
  const [designerName, setDesignerName] = useState("Tola Adekunle");
  const [designerEmail, setDesignerEmail] = useState("studio@tola.ng");
  const [yards, setYards] = useState(Math.max(fabric.minOrderYards, 12));
  const [status, setStatus] = useState<
    "idle" | "creating" | "funding" | "sent" | "error"
  >("idle");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Local fee preview — kept in lockstep with the server math by reusing
  // the same `computeFees` helper. Server is the source of truth on submit.
  const fees: EscrowFeeBreakdown = useMemo(
    () => computeFees(yards, fabric.pricePerYardNgn),
    [yards, fabric.pricePerYardNgn],
  );

  useEffect(() => {
    if (!open) {
      setStatus("idle");
      setOrderId(null);
      setErrorMsg(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const submit = async () => {
    setStatus("creating");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/escrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fabricId: fabric.id,
          designerName,
          designerEmail,
          yards,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      const id = data.order.id as string;
      setOrderId(id);

      // Then "fund" it. In production this is a Paystack/Flutterwave hand-off
      // that returns to /api/escrow/[id] with `to: "funded"`. Here we mock
      // the funding step inline for the demo.
      setStatus("funding");
      const fundRes = await fetch(`/api/escrow/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "funded",
          actor: "designer",
          note: "Mock funding via Threadline checkout.",
        }),
      });
      if (!fundRes.ok) {
        const f = await fundRes.json();
        throw new Error(f.error ?? "Funding failed");
      }
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <Backdrop onClick={onClose}>
          <Panel onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full p-1.5 text-charcoal-400 transition hover:bg-cream-100 hover:text-charcoal-700"
            >
              <X className="h-4 w-4" />
            </button>

            {status === "sent" && orderId ? (
              <SuccessView
                orderId={orderId}
                onView={() => {
                  router.push(`/escrow/${orderId}`);
                  onClose();
                }}
                onClose={onClose}
              />
            ) : (
              <>
                <div className="px-6 pt-6">
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-indigo-700">
                    <ShieldCheck className="h-3 w-3" />
                    Threadline Protected
                  </span>
                  <h3 className="mt-3 font-display text-2xl font-semibold text-charcoal-900">
                    Place a secure order with {supplier.name}
                  </h3>
                  <p className="mt-1 text-sm text-charcoal-400">
                    Funds are held in escrow until you confirm the fabric
                    matches the listing. Only released after delivery.
                  </p>
                </div>

                <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
                  <Field label="Your name">
                    <input
                      className="input"
                      value={designerName}
                      onChange={(e) => setDesignerName(e.target.value)}
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      className="input"
                      type="email"
                      value={designerEmail}
                      onChange={(e) => setDesignerEmail(e.target.value)}
                    />
                  </Field>
                  <Field label={`Yards · MOQ ${fabric.minOrderYards}`}>
                    <input
                      className="input"
                      type="number"
                      min={fabric.minOrderYards}
                      value={yards}
                      onChange={(e) =>
                        setYards(Math.max(1, Number(e.target.value)))
                      }
                    />
                  </Field>
                  <Field label="Price per yard">
                    <div className="input flex items-center bg-cream-100 text-charcoal-700">
                      {formatNaira(fabric.pricePerYardNgn)}
                    </div>
                  </Field>
                </div>

                <div className="mx-6 mb-5 rounded-2xl border border-charcoal-100 bg-cream-100/60 p-4">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-charcoal-400">
                    Order summary
                  </p>
                  <dl className="mt-3 space-y-2 text-sm">
                    <Row
                      label={`${yards} yards × ${formatNaira(fabric.pricePerYardNgn)}`}
                      value={formatNaira(fees.subtotalNgn)}
                    />
                    <Row
                      label={`Threadline transaction fee · ${(fees.transactionFeeRate * 100).toFixed(1)}%`}
                      value={formatNaira(fees.transactionFeeNgn)}
                      muted
                    />
                    <Row
                      label={`Escrow protection · ${(fees.escrowFeeRate * 100).toFixed(1)}%`}
                      value={formatNaira(fees.escrowFeeNgn)}
                      muted
                    />
                    <div className="my-1 border-t border-charcoal-100" />
                    <Row
                      label="You pay today (held in escrow)"
                      value={formatNaira(fees.totalChargedNgn)}
                      strong
                    />
                    <Row
                      label="Producer receives on confirmation"
                      value={formatNaira(fees.producerPayoutNgn)}
                      muted
                    />
                  </dl>
                </div>

                <div className="mx-6 mb-5 grid gap-3 sm:grid-cols-3">
                  <Reassurance
                    icon={<Lock className="h-4 w-4" />}
                    title="Funds held"
                    body="Producer can't withdraw until you confirm."
                  />
                  <Reassurance
                    icon={<Truck className="h-4 w-4" />}
                    title="Tracked dispatch"
                    body="Producer adds tracking before funds move."
                  />
                  <Reassurance
                    icon={<ShieldCheck className="h-4 w-4" />}
                    title="7-day inspection"
                    body="Open a dispute any time before auto-release."
                  />
                </div>

                <div className="flex flex-col gap-3 border-t border-charcoal-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-charcoal-400">
                    Threadline keeps {(TOTAL_FEE_RATE * 100).toFixed(1)}% of
                    every transaction — that's how we underwrite buyer
                    protection.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="btn-ghost"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={submit}
                      disabled={status === "creating" || status === "funding"}
                      className="btn-primary"
                    >
                      {status === "creating" || status === "funding" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {status === "creating"
                            ? "Drafting…"
                            : "Charging escrow…"}
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          Pay {formatNaira(fees.totalChargedNgn)} into escrow
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <p className="px-6 pb-4 text-xs text-terracotta-700">
                    Couldn&apos;t place order: {errorMsg}
                  </p>
                )}
              </>
            )}
          </Panel>
        </Backdrop>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
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

function Reassurance({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-charcoal-100 bg-white px-3 py-3">
      <div className="flex items-center gap-2 text-indigo-700">
        {icon}
        <p className="text-xs font-semibold text-charcoal-900">{title}</p>
      </div>
      <p className="mt-1 text-[11px] leading-relaxed text-charcoal-400">
        {body}
      </p>
    </div>
  );
}

function Backdrop({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <motion.div
      variants={overlayVariants}
      initial="hidden"
      animate="show"
      exit="hidden"
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-6"
    >
      {children}
    </motion.div>
  );
}

function Panel(props: HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={panelVariants}
      initial="hidden"
      animate="show"
      exit="hidden"
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-cream-50 shadow-soft sm:rounded-3xl"
      {...props}
    />
  );
}

function SuccessView({
  orderId,
  onView,
  onClose,
}: {
  orderId: string;
  onView: () => void;
  onClose: () => void;
}) {
  return (
    <div className="px-6 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-700">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-2xl font-semibold text-charcoal-900">
        Funds held in escrow
      </h3>
      <p className="mt-2 text-sm text-charcoal-400">
        Threadline is holding your funds. The producer is notified and will
        ship within their lead window. You'll only release the payment after
        you confirm the fabric.
      </p>
      <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-charcoal-900 px-4 py-2 text-xs text-cream-50">
        <Lock className="h-3 w-3" />
        <span className="font-mono">{orderId}</span>
      </div>
      <div className="mt-6 flex justify-center gap-2">
        <button onClick={onClose} className="btn-ghost">
          Done
        </button>
        <button onClick={onView} className="btn-primary">
          View order
        </button>
      </div>
    </div>
  );
}

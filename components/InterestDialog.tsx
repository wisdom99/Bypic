"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  type HTMLMotionProps,
  type Variants,
} from "framer-motion";
import {
  BellRing,
  CheckCircle2,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Users,
  X,
} from "lucide-react";
import type { ContactChannel, Fabric, Supplier } from "@/lib/types";
import { cn } from "@/lib/utils";

const CHANNEL_ICON: Record<ContactChannel, React.ReactNode> = {
  whatsapp: <MessageCircle className="h-3.5 w-3.5" />,
  email: <Mail className="h-3.5 w-3.5" />,
  phone: <Phone className="h-3.5 w-3.5" />,
};

const CHANNEL_LABEL: Record<ContactChannel, string> = {
  whatsapp: "WhatsApp",
  email: "Email",
  phone: "Phone call",
};

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

const panelVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1 },
};

interface InterestDialogProps {
  open: boolean;
  onClose: () => void;
  fabric: Fabric;
  supplier: Supplier;
  shortfallContext?: boolean;
}

interface SavedInterest {
  id: string;
  fabricId: string;
  fabricName: string;
  supplierId: string;
  supplierName: string;
  targetYards: number;
  neededBy: string;
  preferredChannel: ContactChannel;
  createdAt: string;
}

const STORAGE_KEY = "threadline.savedInterests";

export function InterestDialog({
  open,
  onClose,
  fabric,
  supplier,
  shortfallContext,
}: InterestDialogProps) {
  const [designerName, setDesignerName] = useState("Tola Adekunle");
  const [designerEmail, setDesignerEmail] = useState("studio@tola.ng");
  const [targetYards, setTargetYards] = useState(
    Math.max(fabric.minOrderYards, 24),
  );
  const [neededBy, setNeededBy] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 35);
    return d.toISOString().slice(0, 10);
  });
  const [note, setNote] = useState("");
  const [preferredChannel, setPreferredChannel] = useState<ContactChannel>(
    supplier.contactChannels[0] ?? "email",
  );
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [confirmation, setConfirmation] = useState<{
    id: string;
    matchedDemand: number;
    matchedYards: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setStatus("idle");
      setConfirmation(null);
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

  const headline = useMemo(() => {
    if (shortfallContext) {
      return `Stock is below MOQ — flag your demand`;
    }
    return `Plant a flag for ${fabric.name}`;
  }, [shortfallContext, fabric.name]);

  const subhead = useMemo(() => {
    if (shortfallContext) {
      return `${supplier.name} only has ${fabric.inStockYards} yards in stock (MOQ ${fabric.minOrderYards}). Express interest and they'll be notified the moment a new run is planned.`;
    }
    return `${supplier.name} is notified instantly. They'll see how many other designers want this fabric and can plan a production run that matches the demand.`;
  }, [shortfallContext, supplier, fabric]);

  const submit = async () => {
    setStatus("sending");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fabricId: fabric.id,
          supplierId: supplier.id,
          designerName,
          designerEmail,
          targetYards,
          neededBy,
          note: note.trim() || undefined,
          preferredChannel,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      saveInterestLocally({
        id: data.id,
        fabricId: fabric.id,
        fabricName: fabric.name,
        supplierId: supplier.id,
        supplierName: supplier.name,
        targetYards,
        neededBy,
        preferredChannel,
        createdAt: data.createdAt,
      });
      setConfirmation({
        id: data.id,
        matchedDemand: data.matchedDemand,
        matchedYards: data.matchedYards,
      });
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

            {status === "sent" && confirmation ? (
              <SuccessView
                confirmation={confirmation}
                supplier={supplier}
                fabric={fabric}
                preferredChannel={preferredChannel}
                onClose={onClose}
              />
            ) : (
              <>
                <div className="px-6 pt-6">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-terracotta-50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-terracotta-700">
                    <BellRing className="h-3 w-3" />
                    Express interest
                  </div>
                  <h3 className="mt-2 font-display text-2xl font-semibold text-charcoal-900">
                    {headline}
                  </h3>
                  <p className="mt-2 text-sm text-charcoal-400">{subhead}</p>
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
                  <Field label="Target yards">
                    <input
                      className="input"
                      type="number"
                      min={1}
                      value={targetYards}
                      onChange={(e) =>
                        setTargetYards(Math.max(1, Number(e.target.value)))
                      }
                    />
                    <p className="mt-1.5 text-[11px] text-charcoal-400">
                      Aspirational — no commitment until you confirm an RFQ.
                    </p>
                  </Field>
                  <Field label="Needed by">
                    <input
                      className="input"
                      type="date"
                      value={neededBy}
                      onChange={(e) => setNeededBy(e.target.value)}
                    />
                  </Field>
                  <Field label="Notify me on" className="sm:col-span-2">
                    <div className="flex flex-wrap gap-2">
                      {supplier.contactChannels.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setPreferredChannel(c)}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                            preferredChannel === c
                              ? "border-terracotta-500 bg-terracotta-500 text-cream-50"
                              : "border-charcoal-100 bg-white text-charcoal-700 hover:border-terracotta-500/40",
                          )}
                        >
                          {CHANNEL_ICON[c]} {CHANNEL_LABEL[c]}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field
                    label="Note to the producer · optional"
                    className="sm:col-span-2"
                  >
                    <textarea
                      className="input min-h-[88px] resize-y text-[13px] leading-relaxed"
                      placeholder="e.g. SS26 capsule, 12 looks, willing to wait if you do a fresh dye batch."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </Field>
                </div>
                <div className="flex flex-col gap-3 border-t border-charcoal-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-charcoal-400">
                    {supplier.name} is notified on{" "}
                    {CHANNEL_LABEL[preferredChannel]}. Your demand also feeds
                    the producer trends board.
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
                      disabled={status === "sending"}
                      className="btn-terracotta"
                    >
                      {status === "sending" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          <BellRing className="h-4 w-4" /> Notify me & producer
                        </>
                      )}
                    </button>
                  </div>
                </div>
                {errorMsg && (
                  <p className="px-6 pb-4 text-xs text-terracotta-700">
                    Couldn&apos;t send: {errorMsg}
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
      className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-cream-50 shadow-soft sm:rounded-3xl"
      {...props}
    />
  );
}

function SuccessView({
  confirmation,
  supplier,
  fabric,
  preferredChannel,
  onClose,
}: {
  confirmation: { id: string; matchedDemand: number; matchedYards: number };
  supplier: Supplier;
  fabric: Fabric;
  preferredChannel: ContactChannel;
  onClose: () => void;
}) {
  const others = Math.max(0, confirmation.matchedDemand - 1);
  return (
    <div className="px-6 py-9 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-terracotta-50 text-terracotta-700">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-2xl font-semibold text-charcoal-900">
        Producer notified
      </h3>
      <p className="mt-2 text-sm text-charcoal-400">
        We pinged {supplier.name.split(" ")[0]} on{" "}
        {CHANNEL_LABEL[preferredChannel]}. They&apos;ll reach out the moment{" "}
        {fabric.name} is ready or a new run is planned.
      </p>
      {others > 0 && (
        <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-charcoal-900 px-4 py-2 text-xs text-cream-50">
          <Users className="h-3.5 w-3.5" />
          You&apos;re not alone — {others} other{" "}
          {others === 1 ? "designer wants" : "designers want"} this fabric (
          {confirmation.matchedYards} yards in flight)
        </div>
      )}
      <div className="mt-2 text-[11px] text-charcoal-400">
        Reference {confirmation.id}
      </div>
      <div className="mt-6 flex justify-center">
        <button onClick={onClose} className="btn-primary">
          Done
        </button>
      </div>
    </div>
  );
}

function saveInterestLocally(rec: SavedInterest) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const list: SavedInterest[] = raw ? JSON.parse(raw) : [];
    list.unshift(rec);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 25)));
  } catch {
    /* ignore quota errors */
  }
}

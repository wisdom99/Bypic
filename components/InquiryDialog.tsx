"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  type HTMLMotionProps,
  type Variants,
} from "framer-motion";
import { CheckCircle2, Loader2, X, Send, MessageCircle, Mail, Phone } from "lucide-react";
import type { ContactChannel, Fabric, Supplier } from "@/lib/types";
import { cn, formatNaira } from "@/lib/utils";

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

interface InquiryDialogProps {
  open: boolean;
  onClose: () => void;
  fabric: Fabric;
  supplier: Supplier;
}

interface SavedRfq {
  id: string;
  fabricId: string;
  fabricName: string;
  supplierId: string;
  supplierName: string;
  yardsNeeded: number;
  deadline: string;
  preferredChannel: ContactChannel;
  receivedAt: string;
}

const STORAGE_KEY = "threadline.savedRfqs";

export function InquiryDialog({
  open,
  onClose,
  fabric,
  supplier,
}: InquiryDialogProps) {
  const [designerName, setDesignerName] = useState("Tola Adekunle");
  const [designerEmail, setDesignerEmail] = useState("studio@tola.ng");
  const [yardsNeeded, setYardsNeeded] = useState(
    Math.max(fabric.minOrderYards, 12),
  );
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 21);
    return d.toISOString().slice(0, 10);
  });
  const [preferredChannel, setPreferredChannel] = useState<ContactChannel>(
    supplier.contactChannels[0] ?? "email",
  );
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [confirmationId, setConfirmationId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const draftMessage = useMemo(
    () =>
      buildDraftMessage({
        designerName,
        fabric,
        supplier,
        yardsNeeded,
        deadline,
      }),
    [designerName, fabric, supplier, yardsNeeded, deadline],
  );
  const [message, setMessage] = useState(draftMessage);

  useEffect(() => {
    setMessage(draftMessage);
  }, [draftMessage]);

  useEffect(() => {
    if (!open) {
      setStatus("idle");
      setConfirmationId(null);
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
    setStatus("sending");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fabricId: fabric.id,
          supplierId: supplier.id,
          designerName,
          designerEmail,
          yardsNeeded,
          deadline,
          message,
          preferredChannel,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setConfirmationId(data.id);
      saveRfqLocally({
        id: data.id,
        fabricId: fabric.id,
        fabricName: fabric.name,
        supplierId: supplier.id,
        supplierName: supplier.name,
        yardsNeeded,
        deadline,
        preferredChannel,
        receivedAt: data.receivedAt,
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
              aria-label="Close inquiry"
              className="absolute right-4 top-4 rounded-full p-1.5 text-charcoal-400 transition hover:bg-cream-100 hover:text-charcoal-700"
            >
              <X className="h-4 w-4" />
            </button>

            {status === "sent" && confirmationId ? (
              <SuccessView
                confirmationId={confirmationId}
                supplier={supplier}
                fabric={fabric}
                preferredChannel={preferredChannel}
                onClose={onClose}
              />
            ) : (
              <>
                <div className="px-6 pt-6">
                  <p className="text-xs uppercase tracking-wider text-terracotta-600">
                    Send inquiry
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-semibold text-charcoal-900">
                    Request a quote from {supplier.name}
                  </h3>
                  <p className="mt-1 text-sm text-charcoal-400">
                    {fabric.name} · {formatNaira(fabric.pricePerYardNgn)}/yd ·
                    MOQ {fabric.minOrderYards} yards
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
                  <Field label={`Yards needed · MOQ ${fabric.minOrderYards}`}>
                    <input
                      className="input"
                      type="number"
                      min={fabric.minOrderYards}
                      value={yardsNeeded}
                      onChange={(e) =>
                        setYardsNeeded(Math.max(1, Number(e.target.value)))
                      }
                    />
                  </Field>
                  <Field label="Need-by date">
                    <input
                      className="input"
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                    />
                  </Field>
                  <Field label="Preferred channel" className="sm:col-span-2">
                    <div className="flex flex-wrap gap-2">
                      {supplier.contactChannels.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setPreferredChannel(c)}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                            preferredChannel === c
                              ? "border-indigo-700 bg-indigo-700 text-cream-50"
                              : "border-charcoal-100 bg-white text-charcoal-700 hover:border-indigo-700/40",
                          )}
                        >
                          {CHANNEL_ICON[c]} {CHANNEL_LABEL[c]}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field
                    label="Message · auto-drafted"
                    className="sm:col-span-2"
                  >
                    <textarea
                      className="input min-h-[160px] resize-y font-mono text-[13px] leading-relaxed"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <p className="mt-1.5 text-[11px] text-charcoal-400">
                      Threadline auto-drafts your RFQ from the listing
                      details. Edit freely before sending.
                    </p>
                  </Field>
                </div>
                <div className="flex flex-col gap-3 border-t border-charcoal-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-charcoal-400">
                    Sending creates a tracked RFQ and notifies the supplier on{" "}
                    {CHANNEL_LABEL[preferredChannel]}.
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
                      className="btn-primary"
                    >
                      {status === "sending" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" /> Send inquiry
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
      className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-cream-50 shadow-soft sm:rounded-3xl"
      {...props}
    />
  );
}

function SuccessView({
  confirmationId,
  supplier,
  fabric,
  preferredChannel,
  onClose,
}: {
  confirmationId: string;
  supplier: Supplier;
  fabric: Fabric;
  preferredChannel: ContactChannel;
  onClose: () => void;
}) {
  return (
    <div className="px-6 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-700">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-2xl font-semibold text-charcoal-900">
        Inquiry sent to {supplier.name}
      </h3>
      <p className="mt-2 text-sm text-charcoal-400">
        We&apos;ll ping {supplier.name.split(" ")[0]} on{" "}
        {CHANNEL_LABEL[preferredChannel]} and post their reply on your
        dashboard.
      </p>
      <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-charcoal-900 px-4 py-2 text-xs text-cream-50">
        <span className="font-mono">RFQ {confirmationId}</span>
        <span className="text-cream-50/60">· {fabric.name}</span>
      </div>
      <div className="mt-6 flex justify-center">
        <button onClick={onClose} className="btn-primary">
          Done
        </button>
      </div>
    </div>
  );
}

function buildDraftMessage({
  designerName,
  fabric,
  supplier,
  yardsNeeded,
  deadline,
}: {
  designerName: string;
  fabric: Fabric;
  supplier: Supplier;
  yardsNeeded: number;
  deadline: string;
}): string {
  const firstName = supplier.name.split(" ")[0];
  const date = new Date(deadline);
  const dateStr = date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return [
    `Hi ${firstName} team,`,
    "",
    `I'm ${designerName}. I came across the "${fabric.name}" listing on Threadline and it fits a project I'm in production on.`,
    "",
    `Could you confirm:`,
    `• Stock availability for ${yardsNeeded} yards`,
    `• Lead time to ${dateStr}`,
    `• Best wholesale rate at this volume`,
    `• Any minimum-cut or sample-yard policy`,
    "",
    `Happy to share a tech pack and reference photos. Looking forward to working together.`,
    "",
    `— ${designerName}`,
  ].join("\n");
}

function saveRfqLocally(rfq: SavedRfq) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const list: SavedRfq[] = raw ? JSON.parse(raw) : [];
    list.unshift(rfq);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 25)));
  } catch {
    /* ignore quota errors */
  }
}

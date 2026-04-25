"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Sparkles,
} from "lucide-react";
import { HERITAGES, REGIONS } from "@/lib/data";
import type {
  ContactChannel,
  Heritage,
  NigerianHub,
  SupplierApplicationConfirmation,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const CHANNELS: { id: ContactChannel; label: string; icon: React.ReactNode }[] = [
  { id: "whatsapp", label: "WhatsApp", icon: <MessageCircle className="h-3.5 w-3.5" /> },
  { id: "email", label: "Email", icon: <Mail className="h-3.5 w-3.5" /> },
  { id: "phone", label: "Phone", icon: <Phone className="h-3.5 w-3.5" /> },
];

const STORAGE_KEY = "threadline.savedSupplierApplications";
const CURRENT_YEAR = new Date().getFullYear();

interface SavedApplication {
  id: string;
  workshopName: string;
  region: NigerianHub;
  createdAt: string;
}

export function SupplierRegisterClient() {
  const [workshopName, setWorkshopName] = useState("");
  const [tagline, setTagline] = useState("");
  const [story, setStory] = useState("");
  const [region, setRegion] = useState<NigerianHub>("Lagos");
  const [established, setEstablished] = useState<number>(CURRENT_YEAR - 5);
  const [specialties, setSpecialties] = useState<Heritage[]>([]);
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("+234");
  const [phone, setPhone] = useState("");
  const [contactChannels, setContactChannels] = useState<ContactChannel[]>([
    "whatsapp",
    "email",
  ]);
  const [preferredChannel, setPreferredChannel] =
    useState<ContactChannel>("whatsapp");
  const [leadTimeMin, setLeadTimeMin] = useState(7);
  const [leadTimeMax, setLeadTimeMax] = useState(14);
  const [minOrderYards, setMinOrderYards] = useState(6);
  const [sampleWork, setSampleWork] = useState("");

  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmation, setConfirmation] =
    useState<SupplierApplicationConfirmation | null>(null);

  // If the preferred channel falls outside the selected channels, snap it.
  useEffect(() => {
    if (!contactChannels.includes(preferredChannel)) {
      setPreferredChannel(contactChannels[0] ?? "email");
    }
  }, [contactChannels, preferredChannel]);

  const toggleSpecialty = (h: Heritage) => {
    setSpecialties((prev) =>
      prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h],
    );
  };

  const toggleChannel = (c: ContactChannel) => {
    setContactChannels((prev) => {
      if (prev.includes(c)) {
        if (prev.length === 1) return prev;
        return prev.filter((x) => x !== c);
      }
      return [...prev, c];
    });
  };

  const validationError = useMemo(() => {
    if (workshopName.trim().length < 2) return "Add your workshop name";
    if (tagline.trim().length < 8) return "Add a one-line tagline (8+ chars)";
    if (story.trim().length < 40)
      return "Tell us a bit more about your craft (40+ chars)";
    if (specialties.length === 0) return "Pick at least one heritage you work in";
    if (contactName.trim().length < 2) return "Add a contact name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Add a valid contact email";
    if (contactChannels.includes("whatsapp") && whatsapp.trim().length < 7)
      return "Add a WhatsApp number or remove WhatsApp as a channel";
    if (contactChannels.includes("phone") && phone.trim().length < 7)
      return "Add a phone number or remove Phone as a channel";
    if (leadTimeMax < leadTimeMin)
      return "Lead time max must be ≥ min";
    if (established < 1900 || established > CURRENT_YEAR)
      return "Year established looks off";
    return null;
  }, [
    workshopName,
    tagline,
    story,
    specialties,
    contactName,
    email,
    contactChannels,
    whatsapp,
    phone,
    leadTimeMax,
    leadTimeMin,
    established,
  ]);

  const submit = async () => {
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }
    setStatus("submitting");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/suppliers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workshopName: workshopName.trim(),
          tagline: tagline.trim(),
          story: story.trim(),
          region,
          established,
          specialties,
          contactName: contactName.trim(),
          email: email.trim(),
          whatsapp: contactChannels.includes("whatsapp")
            ? whatsapp.trim()
            : undefined,
          phone: contactChannels.includes("phone") ? phone.trim() : undefined,
          contactChannels,
          preferredChannel,
          leadTimeMin,
          leadTimeMax,
          minOrderYards,
          sampleWork: sampleWork.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as SupplierApplicationConfirmation;
      saveApplicationLocally({
        id: data.id,
        workshopName: data.workshopName,
        region: data.region,
        createdAt: data.createdAt,
      });
      setConfirmation(data);
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Couldn't submit");
    }
  };

  if (status === "sent" && confirmation) {
    return <SuccessCard confirmation={confirmation} />;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="card flex flex-col gap-6 p-6 md:p-8"
    >
      <div>
        <p className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-indigo-700">
          <BadgeCheck className="h-3 w-3" />
          Verification application
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-charcoal-900">
          Tell us about your workshop
        </h2>
        <p className="mt-1 text-sm text-charcoal-400">
          Takes about three minutes. Required fields are marked with an asterisk.
        </p>
      </div>

      <Fieldset legend="Workshop basics">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Workshop name *">
            <input
              className="input"
              placeholder="e.g. Itoku Indigo Collective"
              value={workshopName}
              onChange={(e) => setWorkshopName(e.target.value)}
            />
          </Field>
          <Field label="Year established *">
            <input
              className="input"
              type="number"
              min={1900}
              max={CURRENT_YEAR}
              value={established}
              onChange={(e) =>
                setEstablished(
                  Math.max(
                    1900,
                    Math.min(CURRENT_YEAR, Number(e.target.value) || CURRENT_YEAR),
                  ),
                )
              }
            />
          </Field>
          <Field label="One-line tagline *" className="sm:col-span-2">
            <input
              className="input"
              placeholder="Hand-dyed indigo from the heart of Abeokuta"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              maxLength={140}
            />
            <p className="mt-1.5 text-[11px] text-charcoal-400">
              {tagline.length}/140 — what shows under your name in the marketplace.
            </p>
          </Field>
          <Field label="Region *">
            <select
              className="input appearance-none"
              value={region}
              onChange={(e) => setRegion(e.target.value as NigerianHub)}
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Specialties *">
            <div className="flex flex-wrap gap-1.5">
              {HERITAGES.map((h) => {
                const active = specialties.includes(h);
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => toggleSpecialty(h)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition",
                      active
                        ? "border-indigo-700 bg-indigo-700 text-cream-50"
                        : "border-charcoal-100 bg-white text-charcoal-700 hover:border-indigo-700/40",
                    )}
                  >
                    {h}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Your craft story *" className="sm:col-span-2">
            <textarea
              className="input min-h-[120px] resize-y text-[13px] leading-relaxed"
              placeholder="Where you work, who weaves with you, and what makes your fabric different. Designers read this on your supplier page."
              value={story}
              onChange={(e) => setStory(e.target.value)}
              maxLength={1200}
            />
            <p className="mt-1.5 text-[11px] text-charcoal-400">
              {story.length}/1200
            </p>
          </Field>
        </div>
      </Fieldset>

      <Fieldset legend="Production">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Lead time min (days) *">
            <input
              className="input"
              type="number"
              min={1}
              max={120}
              value={leadTimeMin}
              onChange={(e) =>
                setLeadTimeMin(Math.max(1, Number(e.target.value) || 1))
              }
            />
          </Field>
          <Field label="Lead time max (days) *">
            <input
              className="input"
              type="number"
              min={1}
              max={180}
              value={leadTimeMax}
              onChange={(e) =>
                setLeadTimeMax(Math.max(1, Number(e.target.value) || 1))
              }
            />
          </Field>
          <Field label="Minimum order (yards) *">
            <input
              className="input"
              type="number"
              min={1}
              max={500}
              value={minOrderYards}
              onChange={(e) =>
                setMinOrderYards(Math.max(1, Number(e.target.value) || 1))
              }
            />
          </Field>
        </div>
      </Fieldset>

      <Fieldset legend="How designers should reach you">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contact name *">
            <input
              className="input"
              placeholder="Full name of the person we should call"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
          </Field>
          <Field label="Email *">
            <input
              className="input"
              type="email"
              placeholder="orders@yourworkshop.ng"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Channels Threadline can route inquiries on *" className="sm:col-span-2">
            <div className="flex flex-wrap gap-2">
              {CHANNELS.map((c) => {
                const active = contactChannels.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleChannel(c.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                      active
                        ? "border-terracotta-500 bg-terracotta-500 text-cream-50"
                        : "border-charcoal-100 bg-white text-charcoal-700 hover:border-terracotta-500/40",
                    )}
                  >
                    {c.icon} {c.label}
                  </button>
                );
              })}
            </div>
          </Field>
          {contactChannels.includes("whatsapp") && (
            <Field label="WhatsApp number *">
              <input
                className="input"
                placeholder="+2348012345678"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
            </Field>
          )}
          {contactChannels.includes("phone") && (
            <Field label="Phone number *">
              <input
                className="input"
                placeholder="+2348012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Field>
          )}
          <Field label="Preferred channel for the verification call *" className="sm:col-span-2">
            <div className="flex flex-wrap gap-2">
              {contactChannels.map((c) => {
                const meta = CHANNELS.find((x) => x.id === c)!;
                const active = preferredChannel === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setPreferredChannel(c)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                      active
                        ? "border-indigo-700 bg-indigo-700 text-cream-50"
                        : "border-charcoal-100 bg-white text-charcoal-700 hover:border-indigo-700/40",
                    )}
                  >
                    {meta.icon} {meta.label}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field
            label="Sample work or portfolio link · optional"
            className="sm:col-span-2"
          >
            <input
              className="input"
              placeholder="https://instagram.com/yourworkshop"
              value={sampleWork}
              onChange={(e) => setSampleWork(e.target.value)}
            />
          </Field>
        </div>
      </Fieldset>

      <div className="flex flex-col gap-3 border-t border-charcoal-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-1.5 text-xs text-charcoal-400">
          <MapPin className="h-3.5 w-3.5" />
          We&apos;ll contact you on{" "}
          <span className="font-medium text-charcoal-700">
            {CHANNELS.find((c) => c.id === preferredChannel)?.label}
          </span>{" "}
          within a few days.
        </p>
        <button
          type="button"
          onClick={submit}
          disabled={status === "submitting" || !!validationError}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit application
            </>
          )}
        </button>
      </div>
      {(errorMsg || validationError) && (
        <p className="text-xs text-terracotta-700">
          {errorMsg ?? validationError}
        </p>
      )}
    </motion.section>
  );
}

function Fieldset({
  legend,
  children,
}: {
  legend: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="rounded-2xl border border-charcoal-100 bg-cream-50/40 p-5">
      <legend className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-charcoal-400">
        {legend}
      </legend>
      <div className="mt-2">{children}</div>
    </fieldset>
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

function SuccessCard({
  confirmation,
}: {
  confirmation: SupplierApplicationConfirmation;
}) {
  const channelLabel =
    CHANNELS.find((c) => c.id === confirmation.preferredChannel)?.label ??
    confirmation.preferredChannel;
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="card flex flex-col gap-5 p-8 text-center"
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-700">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <div>
        <h2 className="font-display text-2xl font-semibold text-charcoal-900">
          Application received
        </h2>
        <p className="mt-2 text-sm text-charcoal-400">
          Thank you — Threadline has{" "}
          <span className="font-medium text-charcoal-700">
            {confirmation.workshopName}
          </span>{" "}
          in the verification queue. A reviewer will reach out on{" "}
          <span className="font-medium text-charcoal-700">{channelLabel}</span>{" "}
          to schedule a workshop visit.
        </p>
      </div>
      <dl className="grid grid-cols-3 gap-3 text-left">
        <SuccessStat
          label="Reference"
          value={confirmation.id}
          mono
        />
        <SuccessStat
          label="Queue position"
          value={`#${confirmation.queuePosition}`}
        />
        <SuccessStat
          label="Review window"
          value={`~${confirmation.estimatedReviewDays} days`}
        />
      </dl>
      <div className="mt-2 flex flex-col items-center gap-2 rounded-2xl bg-cream-100/70 p-4 text-xs text-charcoal-700 sm:flex-row sm:justify-center sm:gap-3">
        <Sparkles className="h-3.5 w-3.5 text-indigo-700" />
        Once verified, your workshop is paired with the AI mood-board matcher so
        designers find you by vibe, not just by name.
      </div>
    </motion.section>
  );
}

function SuccessStat({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-charcoal-100 bg-white px-3 py-2">
      <dt className="text-[10px] uppercase tracking-wider text-charcoal-400">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-1 text-sm font-medium text-charcoal-900",
          mono && "font-mono text-[12px]",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function saveApplicationLocally(rec: SavedApplication) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const list: SavedApplication[] = raw ? JSON.parse(raw) : [];
    list.unshift(rec);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 10)));
  } catch {
    /* ignore quota errors */
  }
}

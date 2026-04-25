import Link from "next/link";
import { Sparkles, ArrowRight, BadgeCheck, MessageSquareText, Compass } from "lucide-react";
import { Hero } from "@/components/Hero";
import { FabricCard } from "@/components/FabricCard";
import {
  getFeaturedFabrics,
  getSupplierById,
  getSuppliers,
  HERITAGES,
  HERITAGE_DESCRIPTIONS,
} from "@/lib/data";

export default function HomePage() {
  const featured = getFeaturedFabrics(6);
  const suppliers = getSuppliers().slice(0, 4);

  return (
    <>
      <Hero />

      <section className="container-page py-20">
        <SectionHeader
          eyebrow="How it works"
          title="From inspiration to fabric in three steps"
          description="Designers tell us what they need — by browsing, by mood board, or by sketch — and we route them to the right verified producer with a pre-drafted RFQ."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <Step
            icon={<Sparkles className="h-5 w-5" />}
            title="Match by mood"
            body="Drop a Pinterest board, a runway shot, or your sketch. Our AI extracts colour, texture and mood and ranks Nigerian fabrics that fit."
          />
          <Step
            icon={<Compass className="h-5 w-5" />}
            title="Browse the marketplace"
            body="Filter by heritage, region, price and minimum order. Every listing carries provenance, palette and producer story."
          />
          <Step
            icon={<MessageSquareText className="h-5 w-5" />}
            title="Send a pre-drafted RFQ"
            body="One tap drafts the right message in the right channel — WhatsApp, email or phone — and tracks the inquiry on your dashboard."
          />
        </div>
      </section>

      <section className="bg-cream-100/60 py-20">
        <div className="container-page">
          <div className="flex items-end justify-between gap-4">
            <SectionHeader
              eyebrow="Featured fabrics"
              title="What's loomed, dyed and printed this week"
              description="Hand-picked from producers across six Nigerian textile hubs."
            />
            <Link
              href="/marketplace"
              className="hidden items-center gap-1 text-sm font-medium text-indigo-700 hover:text-indigo-800 md:inline-flex"
            >
              See marketplace <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3">
            {featured.map((fabric) => (
              <FabricCard
                key={fabric.id}
                fabric={fabric}
                supplier={getSupplierById(fabric.supplierId)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <SectionHeader
          eyebrow="Heritage"
          title="The fabrics we carry, and where they come from"
          description="Threadline groups every listing by heritage so designers can search the way they think."
        />
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {HERITAGES.map((heritage) => (
            <Link
              key={heritage}
              href={`/marketplace?heritage=${encodeURIComponent(heritage)}`}
              className="group card flex flex-col gap-2 p-5 transition hover:-translate-y-0.5 hover:border-indigo-700/40"
            >
              <p className="font-display text-lg font-semibold text-charcoal-900">
                {heritage}
              </p>
              <p className="text-xs leading-relaxed text-charcoal-400">
                {HERITAGE_DESCRIPTIONS[heritage]}
              </p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-700 transition group-hover:gap-2">
                Browse {heritage} <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-charcoal-900 py-20 text-cream-50">
        <div className="container-page grid gap-10 md:grid-cols-[1fr_1fr] md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cream-50/60">
              For producers
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight">
              Verified Nigerian textile makers, finally seen.
            </h2>
            <p className="mt-4 max-w-md text-cream-50/80">
              We hand-verify every producer — visiting workshops, confirming
              provenance, and recording lead times — so designers can buy
              local without the late-night Whatsapp hunt.
            </p>
            <Link
              href="/suppliers/register"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-cream-50 px-5 py-2.5 text-sm font-medium text-charcoal-900 transition hover:bg-cream-100"
            >
              Become a verified supplier
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="grid gap-3">
            {suppliers.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-4 rounded-2xl border border-cream-50/10 bg-cream-50/5 p-4"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full font-display text-sm"
                  style={{ backgroundColor: s.avatarColor }}
                >
                  {s.name
                    .split(" ")
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")}
                </div>
                <div className="flex-1">
                  <p className="flex items-center gap-1.5 text-sm font-medium">
                    {s.name}
                    {s.verified && (
                      <BadgeCheck className="h-3.5 w-3.5 text-terracotta-400" />
                    )}
                  </p>
                  <p className="text-xs text-cream-50/60">{s.tagline}</p>
                </div>
                <span className="text-xs text-cream-50/40">{s.region}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs uppercase tracking-[0.2em] text-terracotta-600">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-charcoal-900">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-base text-charcoal-400">{description}</p>
      )}
    </div>
  );
}

function Step({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="card flex flex-col p-6">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-700">
        {icon}
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold text-charcoal-900">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-charcoal-400">{body}</p>
    </div>
  );
}

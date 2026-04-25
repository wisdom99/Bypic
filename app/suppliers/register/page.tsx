import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  ClipboardCheck,
  HandshakeIcon,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { SupplierRegisterClient } from "@/components/SupplierRegisterClient";
import { HERITAGES, REGIONS } from "@/lib/data";
import { countPendingSupplierApplications } from "@/lib/store";

export const metadata = {
  title: "Become a verified supplier · Threadline",
  description:
    "Apply to join Threadline as a verified Nigerian textile producer. Hand-verified workshops get featured in the marketplace and routed pre-drafted RFQs from designers across Africa.",
};

export const dynamic = "force-dynamic";

export default function SupplierRegisterPage() {
  const pending = countPendingSupplierApplications();

  return (
    <div className="container-page py-12 md:py-16">
      <Link
        href="/about"
        className="inline-flex items-center gap-1.5 text-sm text-charcoal-400 transition hover:text-charcoal-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to about
      </Link>

      <div className="mt-6 grid gap-12 lg:grid-cols-[1.1fr_1fr]">
        <section>
          <p className="text-xs uppercase tracking-[0.2em] text-terracotta-600">
            For producers
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-charcoal-900 md:text-5xl">
            Get listed as a verified Threadline supplier.
          </h1>
          <p className="mt-5 max-w-xl text-base text-charcoal-400">
            Tell us about your workshop and we&apos;ll schedule a verification
            visit — usually within a week. Verified producers are featured in
            the marketplace, paired with the AI mood-board matcher, and receive
            pre-drafted RFQs from designers across Lagos, Accra and beyond.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-2 text-xs text-charcoal-400">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-charcoal-100 bg-white px-3 py-1">
              <ClipboardCheck className="h-3 w-3 text-indigo-700" />
              {pending} application{pending === 1 ? "" : "s"} in the queue
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-charcoal-100 bg-white px-3 py-1">
              <ShieldCheck className="h-3 w-3 text-indigo-700" />
              Free during the prototype
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-charcoal-100 bg-white px-3 py-1">
              <MapPin className="h-3 w-3 text-indigo-700" />
              {REGIONS.length} hubs covered
            </span>
          </div>

          <ol className="mt-10 grid gap-4">
            <Step
              number="1"
              icon={<ClipboardCheck className="h-4 w-4" />}
              title="Submit your workshop profile"
              body="Share your craft heritage, lead times, MOQ, and how you'd like designers to reach you."
            />
            <Step
              number="2"
              icon={<HandshakeIcon className="h-4 w-4" />}
              title="Verification visit"
              body="A Threadline reviewer schedules a workshop visit (or video walkthrough) to confirm provenance, dye baths and looms."
            />
            <Step
              number="3"
              icon={<BadgeCheck className="h-4 w-4" />}
              title="Go live as verified"
              body="We seed your supplier page with a story, photos and your first listings. You start receiving designer RFQs that match what you actually make."
            />
          </ol>

          <div className="mt-10 card p-5">
            <p className="font-display text-lg font-semibold text-charcoal-900">
              What we look for
            </p>
            <p className="mt-1 text-sm text-charcoal-400">
              Threadline is heritage-first. We verify workshops that work in
              one or more of these traditions:
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {HERITAGES.map((h) => (
                <span
                  key={h}
                  className="rounded-full border border-charcoal-100 bg-cream-100/70 px-3 py-1 text-xs font-medium text-charcoal-700"
                >
                  {h}
                </span>
              ))}
            </div>
          </div>
        </section>

        <SupplierRegisterClient />
      </div>
    </div>
  );
}

function Step({
  number,
  icon,
  title,
  body,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-4 rounded-2xl border border-charcoal-100 bg-white p-4">
      <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-indigo-50 font-display text-sm font-semibold text-indigo-700">
        {number}
      </div>
      <div className="flex-1">
        <p className="flex items-center gap-1.5 font-display text-base font-semibold text-charcoal-900">
          {icon} {title}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-charcoal-400">{body}</p>
      </div>
    </li>
  );
}

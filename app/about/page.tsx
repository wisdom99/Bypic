import Link from "next/link";
import { ArrowRight, BadgeCheck, Compass, MapPin, Sparkles } from "lucide-react";

export const metadata = {
  title: "About · Threadline",
  description:
    "Threadline is a marketplace connecting Nigerian fashion designers with verified local fabric producers. Built as a hackathon prototype.",
};

export default function AboutPage() {
  return (
    <div>
      <section className="container-page py-20">
        <p className="text-xs uppercase tracking-[0.2em] text-terracotta-600">
          About
        </p>
        <h1 className="mt-2 font-display text-5xl font-semibold leading-tight text-charcoal-900 md:text-6xl">
          Built so designers can buy local without the late-night Whatsapp
          hunt.
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-charcoal-400">
          Nigerian fashion designers spend hours every week messaging strangers
          on Instagram, jumping between Balogun stalls, and chasing producers
          across Aba, Kano and Abeokuta. Threadline turns that scavenger hunt
          into a verified marketplace — and adds an AI mood-board layer so a
          designer can describe a vibe and instantly see the right fabric, the
          right producer, and the right RFQ ready to send.
        </p>
      </section>

      <section className="bg-cream-100/60 py-16">
        <div className="container-page grid gap-6 md:grid-cols-3">
          <Pillar
            icon={<Compass className="h-5 w-5" />}
            title="Heritage-first"
            body="Every listing is tagged with provenance — Adire, Ankara, Aso-oke, Akwete, Kente, lace — so designers can search the way they think."
          />
          <Pillar
            icon={<BadgeCheck className="h-5 w-5" />}
            title="Verified producers"
            body="Threadline hand-verifies workshops across six Nigerian textile hubs, from Balogun in Lagos to the Akwete looms in Abia."
          />
          <Pillar
            icon={<Sparkles className="h-5 w-5" />}
            title="AI that explains itself"
            body="Our mood-board matcher returns a one-line reason for every fabric it suggests, plus a transparent score breakdown."
          />
        </div>
      </section>

      <section className="container-page py-20">
        <h2 className="font-display text-3xl font-semibold text-charcoal-900">
          The textile hubs we cover
        </h2>
        <p className="mt-2 max-w-2xl text-charcoal-400">
          Six clusters — each with a different specialty, lead time, and
          economic story.
        </p>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {HUBS.map((h) => (
            <div key={h.name} className="card p-5">
              <p className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-charcoal-400">
                <MapPin className="h-3 w-3" /> {h.name}
              </p>
              <p className="mt-2 font-display text-xl font-semibold text-charcoal-900">
                {h.craft}
              </p>
              <p className="mt-1 text-sm text-charcoal-400">{h.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-20">
        <div className="card flex flex-col gap-4 p-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-terracotta-600">
              Hackathon prototype
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-charcoal-900">
              Built with Cursor AI in a single sprint
            </h2>
            <p className="mt-2 max-w-xl text-charcoal-400">
              Cursor scaffolded the Next.js app, generated the seed catalog,
              authored the OpenAI vision matcher, and helped translate the
              brief into Yoruba/Igbo heritage tags. Read the source on
              GitHub.
            </p>
          </div>
          <Link href="/match" className="btn-terracotta">
            Try the AI matcher <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

const HUBS = [
  { name: "Lagos", craft: "Wax Ankara · Linen", note: "Balogun Market scale plus modern resort weaves." },
  { name: "Aba", craft: "Akwete · Denim", note: "Igbo handweave alongside an industrial mill belt." },
  { name: "Kano", craft: "Kembe cotton", note: "Hausa cotton craft, Kofar Mata indigo pits." },
  { name: "Onitsha", craft: "Lace & cordlace", note: "Imported lace finished and beaded locally." },
  { name: "Abeokuta", craft: "Adire indigo", note: "Yoruba indigo resist, Itoku women-led co-ops." },
  { name: "Ibadan", craft: "Aso-oke · over-dye", note: "Pit-loom weavers and natural-dye studios." },
];

function Pillar({
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
      <p className="mt-4 font-display text-xl font-semibold text-charcoal-900">
        {title}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-charcoal-400">{body}</p>
    </div>
  );
}

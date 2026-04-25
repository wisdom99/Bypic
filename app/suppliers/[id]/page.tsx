import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Boxes,
  Calendar,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Star,
} from "lucide-react";
import {
  getFabricsBySupplier,
  getSupplierById,
  getSuppliers,
} from "@/lib/data";
import type { ContactChannel } from "@/lib/types";
import { formatLeadTime } from "@/lib/utils";
import { FabricCard } from "@/components/FabricCard";
import { FabricArtwork } from "@/components/FabricArtwork";

export function generateStaticParams() {
  return getSuppliers().map((s) => ({ id: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supplier = getSupplierById(id);
  if (!supplier) return {};
  return {
    title: `${supplier.name} · Threadline`,
    description: supplier.tagline,
  };
}

const CHANNEL_LABEL: Record<ContactChannel, { icon: React.ReactNode; label: string }> =
  {
    whatsapp: { icon: <MessageCircle className="h-3.5 w-3.5" />, label: "WhatsApp" },
    email: { icon: <Mail className="h-3.5 w-3.5" />, label: "Email" },
    phone: { icon: <Phone className="h-3.5 w-3.5" />, label: "Phone" },
  };

export default async function SupplierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supplier = getSupplierById(id);
  if (!supplier) notFound();

  const fabrics = getFabricsBySupplier(supplier.id);
  const heroPalette =
    fabrics[0]?.palette ?? [supplier.avatarColor, "#161513", "#FBF7F1", "#A8512E", "#2D3870"];
  const heroHeritage = supplier.specialties[0] ?? fabrics[0]?.heritage ?? "Cotton";

  return (
    <div>
      <section className="relative h-72 overflow-hidden bg-charcoal-900">
        <div className="absolute inset-0 opacity-80">
          <FabricArtwork
            palette={heroPalette}
            heritage={heroHeritage}
            seed={`supplier-${supplier.id}`}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900 via-charcoal-900/40 to-transparent" />
      </section>
      <div className="container-page -mt-24 pb-12">
        <Link
          href="/marketplace"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-cream-50/80 transition hover:text-cream-50"
        >
          <ArrowLeft className="h-4 w-4" /> Back to marketplace
        </Link>
        <div className="card flex flex-col gap-6 p-6 md:flex-row md:items-center md:gap-8 md:p-8">
          <div
            className="flex h-20 w-20 flex-none items-center justify-center rounded-2xl font-display text-2xl text-cream-50"
            style={{ backgroundColor: supplier.avatarColor }}
          >
            {supplier.name
              .split(" ")
              .slice(0, 2)
              .map((w) => w[0])
              .join("")}
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.2em] text-terracotta-600">
              Verified producer
            </p>
            <h1 className="mt-2 flex flex-wrap items-center gap-2 font-display text-4xl font-semibold leading-tight text-charcoal-900">
              {supplier.name}
              {supplier.verified && (
                <BadgeCheck className="h-7 w-7 text-indigo-700" />
              )}
            </h1>
            <p className="mt-2 max-w-2xl text-base text-charcoal-400">
              {supplier.tagline}
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat
                icon={<MapPin className="h-3.5 w-3.5" />}
                label="Region"
                value={supplier.region}
              />
              <Stat
                icon={<Calendar className="h-3.5 w-3.5" />}
                label="Established"
                value={String(supplier.established)}
              />
              <Stat
                icon={<Clock className="h-3.5 w-3.5" />}
                label="Lead time"
                value={formatLeadTime(supplier.leadTimeDays)}
              />
              <Stat
                icon={<Star className="h-3.5 w-3.5" />}
                label="Rating"
                value={`${supplier.rating.toFixed(1)} · ${supplier.ordersFulfilled} orders`}
              />
            </dl>
          </div>
        </div>

        <div className="mt-10 grid gap-10 md:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-charcoal-900">
              The story
            </h2>
            <p className="text-base leading-relaxed text-charcoal-700">
              {supplier.story}
            </p>
            <div>
              <p className="label mt-4">Specialties</p>
              <div className="flex flex-wrap gap-1.5">
                {supplier.specialties.map((spec) => (
                  <span
                    key={spec}
                    className="rounded-full border border-charcoal-100 bg-white px-3 py-1 text-xs font-medium text-charcoal-700"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="card flex flex-col gap-3 p-5">
            <p className="font-display text-lg font-semibold text-charcoal-900">
              How to reach them
            </p>
            <p className="text-xs text-charcoal-400">
              Threadline routes inquiries through these channels with a
              pre-drafted RFQ.
            </p>
            <ul className="mt-2 space-y-2">
              {supplier.contactChannels.map((c) => (
                <li
                  key={c}
                  className="flex items-center justify-between rounded-xl border border-charcoal-100 bg-white px-3 py-2 text-sm"
                >
                  <span className="inline-flex items-center gap-2 text-charcoal-700">
                    {CHANNEL_LABEL[c].icon}
                    {CHANNEL_LABEL[c].label}
                  </span>
                  <span className="font-mono text-[11px] text-charcoal-400">
                    {c === "email"
                      ? supplier.email
                      : c === "whatsapp"
                        ? supplier.whatsapp
                        : "via Threadline"}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-center gap-2 rounded-xl bg-cream-100 px-3 py-2 text-xs text-charcoal-700">
              <Boxes className="h-3.5 w-3.5" />
              MOQ {supplier.minOrderYards} yards across most listings
            </div>
          </div>
        </div>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold text-charcoal-900">
            Fabrics from {supplier.name}
          </h2>
          <p className="mt-1 text-sm text-charcoal-400">
            {fabrics.length} active listings
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {fabrics.map((f) => (
              <FabricCard key={f.id} fabric={f} supplier={supplier} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-charcoal-400">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-charcoal-900">{value}</dd>
    </div>
  );
}

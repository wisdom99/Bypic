import Link from "next/link";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import type { Supplier } from "@/lib/types";
import { cn, formatLeadTime } from "@/lib/utils";

export function SupplierCard({
  supplier,
  className,
}: {
  supplier: Supplier;
  className?: string;
}) {
  return (
    <Link
      href={`/suppliers/${supplier.id}`}
      className={cn(
        "card flex items-center gap-4 p-4 transition hover:border-charcoal-700/20 hover:bg-cream-50",
        className,
      )}
    >
      <div
        className="flex h-14 w-14 flex-none items-center justify-center rounded-full font-display text-lg text-cream-50"
        style={{ backgroundColor: supplier.avatarColor }}
        aria-hidden="true"
      >
        {supplier.name
          .split(" ")
          .slice(0, 2)
          .map((w) => w[0])
          .join("")}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate font-medium text-charcoal-900">
            {supplier.name}
          </p>
          {supplier.verified && (
            <BadgeCheck
              className="h-4 w-4 flex-none text-indigo-700"
              aria-label="Verified producer"
            />
          )}
        </div>
        <p className="mt-0.5 line-clamp-1 text-xs text-charcoal-400">
          {supplier.tagline}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-charcoal-400">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {supplier.region}
          </span>
          <span className="inline-flex items-center gap-1">
            <Star className="h-3 w-3" /> {supplier.rating.toFixed(1)} ·{" "}
            {supplier.ordersFulfilled} orders
          </span>
          <span>Lead {formatLeadTime(supplier.leadTimeDays)}</span>
        </div>
      </div>
    </Link>
  );
}

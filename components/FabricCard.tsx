import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Fabric, Supplier } from "@/lib/types";
import { cn, formatNaira } from "@/lib/utils";
import { HeritageBadge } from "./HeritageBadge";
import { PaletteSwatches } from "./PaletteSwatches";
import { FabricArtwork } from "./FabricArtwork";

export function FabricCard({
  fabric,
  supplier,
  className,
}: {
  fabric: Fabric;
  supplier?: Supplier;
  className?: string;
}) {
  return (
    <Link
      href={`/fabrics/${fabric.id}`}
      className={cn(
        "group block overflow-hidden rounded-2xl border border-charcoal-100 bg-white transition hover:-translate-y-0.5 hover:shadow-soft",
        className,
      )}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-cream-100">
        <FabricArtwork
          palette={fabric.palette}
          heritage={fabric.heritage}
          seed={fabric.id}
          className="transition duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute left-3 top-3">
          <HeritageBadge heritage={fabric.heritage} />
        </div>
        <div className="absolute bottom-3 right-3">
          <PaletteSwatches palette={fabric.palette} size="sm" />
        </div>
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-semibold leading-tight text-charcoal-900">
            {fabric.name}
          </h3>
          <p className="whitespace-nowrap text-sm font-semibold text-charcoal-900">
            {formatNaira(fabric.pricePerYardNgn)}
            <span className="text-xs font-normal text-charcoal-400">/yd</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-charcoal-400">
          <MapPin className="h-3 w-3" />
          <span>
            {supplier?.name ?? "Verified supplier"} · {fabric.region}
          </span>
        </div>
        <div className="flex flex-wrap gap-1 pt-1">
          {fabric.moodTags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-cream-100 px-2 py-0.5 text-[10px] uppercase tracking-wider text-charcoal-400"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

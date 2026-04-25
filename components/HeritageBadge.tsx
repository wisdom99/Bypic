import type { Heritage } from "@/lib/types";
import { cn } from "@/lib/utils";

const HERITAGE_STYLES: Record<Heritage, string> = {
  Adire: "bg-indigo-700 text-cream-50",
  Ankara: "bg-terracotta-500 text-cream-50",
  "Aso-oke": "bg-terracotta-700 text-cream-50",
  Akwete: "bg-indigo-500 text-cream-50",
  Kente: "bg-[#0E2E1E] text-cream-50",
  Lace: "bg-cream-200 text-charcoal-900",
  Cotton: "bg-charcoal-100 text-charcoal-900",
  Linen: "bg-[#7B8A6E] text-cream-50",
};

export function HeritageBadge({
  heritage,
  className,
}: {
  heritage: Heritage;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider",
        HERITAGE_STYLES[heritage],
        className,
      )}
    >
      {heritage}
    </span>
  );
}

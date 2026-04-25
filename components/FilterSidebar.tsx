"use client";

import { useMemo } from "react";
import { X } from "lucide-react";
import type { Heritage, NigerianHub } from "@/lib/types";
import { HERITAGES, REGIONS } from "@/lib/data";
import { cn, formatNaira } from "@/lib/utils";

export interface FilterState {
  heritages: Heritage[];
  regions: NigerianHub[];
  maxPrice: number;
  maxMoq: number;
}

export const DEFAULT_FILTERS: FilterState = {
  heritages: [],
  regions: [],
  maxPrice: 25000,
  maxMoq: 30,
};

export function FilterSidebar({
  filters,
  onChange,
  resultCount,
  className,
}: {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  resultCount: number;
  className?: string;
}) {
  const isDefault = useMemo(
    () =>
      filters.heritages.length === 0 &&
      filters.regions.length === 0 &&
      filters.maxPrice === DEFAULT_FILTERS.maxPrice &&
      filters.maxMoq === DEFAULT_FILTERS.maxMoq,
    [filters],
  );

  const toggleHeritage = (h: Heritage) => {
    onChange({
      ...filters,
      heritages: filters.heritages.includes(h)
        ? filters.heritages.filter((x) => x !== h)
        : [...filters.heritages, h],
    });
  };

  const toggleRegion = (r: NigerianHub) => {
    onChange({
      ...filters,
      regions: filters.regions.includes(r)
        ? filters.regions.filter((x) => x !== r)
        : [...filters.regions, r],
    });
  };

  return (
    <aside
      className={cn(
        "card sticky top-20 flex flex-col gap-6 self-start p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-charcoal-400">
            Filters
          </p>
          <p className="text-sm font-medium text-charcoal-900">
            {resultCount} fabrics
          </p>
        </div>
        {!isDefault && (
          <button
            type="button"
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-charcoal-400 hover:text-charcoal-700"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      <FilterGroup label="Heritage">
        <div className="flex flex-wrap gap-1.5">
          {HERITAGES.map((h) => {
            const active = filters.heritages.includes(h);
            return (
              <button
                key={h}
                type="button"
                onClick={() => toggleHeritage(h)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition",
                  active
                    ? "border-charcoal-900 bg-charcoal-900 text-cream-50"
                    : "border-charcoal-100 bg-white text-charcoal-700 hover:border-charcoal-700/40",
                )}
              >
                {h}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup label="Region">
        <div className="flex flex-wrap gap-1.5">
          {REGIONS.map((r) => {
            const active = filters.regions.includes(r);
            return (
              <button
                key={r}
                type="button"
                onClick={() => toggleRegion(r)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition",
                  active
                    ? "border-indigo-700 bg-indigo-700 text-cream-50"
                    : "border-charcoal-100 bg-white text-charcoal-700 hover:border-indigo-700/40",
                )}
              >
                {r}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup label={`Max price · ${formatNaira(filters.maxPrice)}/yd`}>
        <input
          type="range"
          min={3000}
          max={25000}
          step={500}
          value={filters.maxPrice}
          onChange={(e) =>
            onChange({ ...filters, maxPrice: Number(e.target.value) })
          }
          className="w-full accent-indigo-700"
        />
        <div className="mt-1 flex justify-between text-[10px] text-charcoal-400">
          <span>₦3,000</span>
          <span>₦25,000</span>
        </div>
      </FilterGroup>

      <FilterGroup label={`Max MOQ · ${filters.maxMoq} yards`}>
        <input
          type="range"
          min={1}
          max={30}
          step={1}
          value={filters.maxMoq}
          onChange={(e) =>
            onChange({ ...filters, maxMoq: Number(e.target.value) })
          }
          className="w-full accent-terracotta-500"
        />
        <div className="mt-1 flex justify-between text-[10px] text-charcoal-400">
          <span>1 yd</span>
          <span>30 yd</span>
        </div>
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="label">{label}</p>
      {children}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import type { Fabric, Heritage, NigerianHub, Supplier } from "@/lib/types";
import { FabricCard } from "./FabricCard";
import {
  FilterSidebar,
  type FilterState,
  DEFAULT_FILTERS,
} from "./FilterSidebar";

type SortOption = "featured" | "price-asc" | "price-desc" | "lead-time";

export function MarketplaceClient({
  fabrics,
  suppliers,
}: {
  fabrics: Fabric[];
  suppliers: Supplier[];
}) {
  const search = useSearchParams();
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortOption>("featured");

  useEffect(() => {
    const heritage = search.get("heritage");
    const region = search.get("region");
    if (heritage || region) {
      setFilters((prev) => ({
        ...prev,
        heritages: heritage
          ? ([heritage] as Heritage[])
          : prev.heritages,
        regions: region ? ([region] as NigerianHub[]) : prev.regions,
      }));
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const supplierIndex = useMemo(() => {
    const map = new Map<string, Supplier>();
    suppliers.forEach((s) => map.set(s.id, s));
    return map;
  }, [suppliers]);

  const filtered = useMemo(() => {
    const list = fabrics.filter((f) => {
      if (
        filters.heritages.length > 0 &&
        !filters.heritages.includes(f.heritage)
      ) {
        return false;
      }
      if (filters.regions.length > 0 && !filters.regions.includes(f.region)) {
        return false;
      }
      if (f.pricePerYardNgn > filters.maxPrice) return false;
      if (f.minOrderYards > filters.maxMoq) return false;
      return true;
    });

    const sorted = [...list];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.pricePerYardNgn - b.pricePerYardNgn);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.pricePerYardNgn - a.pricePerYardNgn);
        break;
      case "lead-time":
        sorted.sort((a, b) => a.leadTimeDays - b.leadTimeDays);
        break;
      default:
        sorted.sort(
          (a, b) => Number(b.featured ?? false) - Number(a.featured ?? false),
        );
    }
    return sorted;
  }, [fabrics, filters, sort]);

  return (
    <div className="container-page py-12">
      <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-terracotta-600">
            Marketplace
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-charcoal-900 md:text-5xl">
            Every yard, sourced from Nigeria
          </h1>
          <p className="mt-3 max-w-xl text-base text-charcoal-400">
            32 fabrics · 10 verified producers · 6 textile hubs.
          </p>
        </div>
        <Link
          href="/match"
          className="btn-terracotta self-start md:self-end"
        >
          <Sparkles className="h-4 w-4" /> Match by mood instead
        </Link>
      </header>

      <div className="grid gap-8 md:grid-cols-[260px_1fr]">
        <FilterSidebar
          filters={filters}
          onChange={setFilters}
          resultCount={filtered.length}
          className="hidden md:flex"
        />
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-charcoal-400 md:hidden">
              {filtered.length} fabrics
            </p>
            <div className="ml-auto flex items-center gap-2 text-sm">
              <label className="text-charcoal-400" htmlFor="sort">
                Sort
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="rounded-full border border-charcoal-100 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price · low to high</option>
                <option value="price-desc">Price · high to low</option>
                <option value="lead-time">Fastest lead time</option>
              </select>
            </div>
          </div>

          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            resultCount={filtered.length}
            className="mb-6 flex md:hidden"
          />

          {filtered.length === 0 ? (
            <div className="card flex flex-col items-center gap-3 p-12 text-center">
              <p className="font-display text-2xl text-charcoal-900">
                No fabrics match these filters yet.
              </p>
              <p className="max-w-sm text-sm text-charcoal-400">
                Try widening your price range, easing the MOQ, or clearing
                heritage filters.
              </p>
              <button
                type="button"
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="btn-ghost mt-2"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((fabric) => (
                <FabricCard
                  key={fabric.id}
                  fabric={fabric}
                  supplier={supplierIndex.get(fabric.supplierId)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

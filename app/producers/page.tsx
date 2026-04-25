import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { DemandBoardClient } from "@/components/DemandBoardClient";
import { countPendingSupplierApplications, getDemandFeed } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Producer demand board · Threadline",
  description:
    "Live trends from Threadline designers — heritages, palettes, fabrics, and regions in highest demand right now. Plan your next run around real signals.",
};

export default function ProducersPage() {
  const feed = getDemandFeed();
  const pending = countPendingSupplierApplications();

  return (
    <div className="container-page py-12">
      <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-charcoal-100 bg-white px-5 py-4 text-sm shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-indigo-50 text-indigo-700">
            <BadgeCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium text-charcoal-900">
              Not yet on Threadline?
            </p>
            <p className="text-xs text-charcoal-400">
              Apply for verification — {pending} workshop
              {pending === 1 ? " is" : "s are"} currently in the queue.
            </p>
          </div>
        </div>
        <Link
          href="/suppliers/register"
          className="btn-primary self-start sm:self-auto"
        >
          Become a verified supplier
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <DemandBoardClient feed={feed} />
    </div>
  );
}

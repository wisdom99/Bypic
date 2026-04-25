import { Suspense } from "react";
import { MarketplaceClient } from "@/components/MarketplaceClient";
import { getFabrics, getSuppliers } from "@/lib/data";

export const metadata = {
  title: "Marketplace · Threadline",
  description:
    "Browse Nigerian fabrics by heritage, region, price and minimum order.",
};

export default function MarketplacePage() {
  const fabrics = getFabrics();
  const suppliers = getSuppliers();

  return (
    <Suspense
      fallback={
        <div className="container-page py-20 text-center text-sm text-charcoal-400">
          Loading marketplace…
        </div>
      }
    >
      <MarketplaceClient fabrics={fabrics} suppliers={suppliers} />
    </Suspense>
  );
}

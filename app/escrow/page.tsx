import type { Metadata } from "next";
import { EscrowDashboardClient } from "@/components/EscrowDashboardClient";
import { getEscrowRevenueStats, listEscrowOrders } from "@/lib/store";

export const metadata: Metadata = {
  title: "Escrow ledger · Threadline",
  description:
    "Trust, priced in. Every Threadline order moves through escrow — funds held until delivery is confirmed, with a 4% protection fee that funds the guarantee.",
};

// Always render the latest store state in dev. The store is in-memory so
// values change as users interact with the demo.
export const dynamic = "force-dynamic";

export default function EscrowDashboardPage() {
  const orders = listEscrowOrders();
  const stats = getEscrowRevenueStats();
  return <EscrowDashboardClient orders={orders} stats={stats} />;
}

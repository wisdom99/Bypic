import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EscrowOrderClient } from "@/components/EscrowOrderClient";
import { getEscrowOrder } from "@/lib/store";
import { STATUS_LABEL } from "@/lib/escrow";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const order = getEscrowOrder(id);
  if (!order) return { title: "Order not found · Threadline" };
  return {
    title: `${order.fabricName} · ${STATUS_LABEL[order.status]} · Threadline`,
    description: `Escrow order ${order.id} — ${order.yards} yards of ${order.fabricName} from ${order.supplierName}.`,
  };
}

export default async function EscrowOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = getEscrowOrder(id);
  if (!order) notFound();
  return <EscrowOrderClient initial={order} />;
}

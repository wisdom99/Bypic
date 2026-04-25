import { notFound } from "next/navigation";
import { FabricDetailClient } from "@/components/FabricDetailClient";
import {
  getFabricById,
  getFabrics,
  getFabricsBySupplier,
  getSupplierById,
  getSuppliers,
} from "@/lib/data";

export function generateStaticParams() {
  return getFabrics().map((f) => ({ id: f.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fabric = getFabricById(id);
  if (!fabric) return {};
  return {
    title: `${fabric.name} · Threadline`,
    description: fabric.description,
  };
}

export default async function FabricPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fabric = getFabricById(id);
  if (!fabric) notFound();
  const supplier = getSupplierById(fabric.supplierId);
  if (!supplier) notFound();

  const related = getFabricsBySupplier(supplier.id)
    .filter((f) => f.id !== fabric.id)
    .slice(0, 4);

  const supplierIndex: Record<string, typeof supplier> = {};
  for (const s of getSuppliers()) supplierIndex[s.id] = s;

  return (
    <FabricDetailClient
      fabric={fabric}
      supplier={supplier}
      related={related}
      relatedSupplierIndex={supplierIndex}
    />
  );
}

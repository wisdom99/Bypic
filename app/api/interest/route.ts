import { NextResponse } from "next/server";
import { z } from "zod";
import { addInterest, countInterestsForFabric } from "@/lib/store";
import { getFabricById, getSupplierById } from "@/lib/data";

const schema = z.object({
  fabricId: z.string(),
  supplierId: z.string(),
  designerName: z.string().min(1),
  designerEmail: z.string().email(),
  targetYards: z.number().int().positive(),
  neededBy: z.string(),
  note: z.string().max(500).optional(),
  preferredChannel: z.enum(["whatsapp", "email", "phone"]),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const fabric = getFabricById(parsed.data.fabricId);
  if (!fabric) {
    return NextResponse.json({ error: "Fabric not found" }, { status: 404 });
  }
  const supplier = getSupplierById(parsed.data.supplierId);
  if (!supplier) {
    return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
  }

  const interest = addInterest(parsed.data);
  const matched = countInterestsForFabric(parsed.data.fabricId);

  return NextResponse.json({
    id: interest.id,
    createdAt: interest.createdAt,
    fabricId: fabric.id,
    supplierId: supplier.id,
    fabricName: fabric.name,
    supplierName: supplier.name,
    matchedDemand: matched.count,
    matchedYards: matched.yards,
  });
}

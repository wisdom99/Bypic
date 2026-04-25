import { NextResponse } from "next/server";
import { z } from "zod";
import { getFabricById } from "@/lib/data";
import { computeFees } from "@/lib/escrow";

const schema = z.object({
  fabricId: z.string(),
  yards: z.number().int().positive(),
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
  if (parsed.data.yards < fabric.minOrderYards) {
    return NextResponse.json(
      {
        error: `Below MOQ — ${fabric.name} requires ${fabric.minOrderYards} yards.`,
      },
      { status: 400 },
    );
  }
  const fees = computeFees(parsed.data.yards, fabric.pricePerYardNgn);
  return NextResponse.json({ fees });
}

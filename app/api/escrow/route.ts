import { NextResponse } from "next/server";
import { z } from "zod";
import { createEscrowOrder, listEscrowOrders } from "@/lib/store";

const schema = z.object({
  fabricId: z.string(),
  designerName: z.string().min(1),
  designerEmail: z.string().email(),
  yards: z.number().int().positive(),
});

export async function GET() {
  return NextResponse.json({ orders: listEscrowOrders() });
}

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
  const result = createEscrowOrder(parsed.data);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ order: result }, { status: 201 });
}

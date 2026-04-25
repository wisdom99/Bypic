import { NextResponse } from "next/server";
import { z } from "zod";
import { getEscrowOrder, transitionEscrowOrder } from "@/lib/store";

const transitionSchema = z.object({
  to: z.enum([
    "pending",
    "funded",
    "shipped",
    "delivered",
    "released",
    "disputed",
    "refunded",
    "cancelled",
  ]),
  actor: z
    .enum(["designer", "producer", "threadline", "system"])
    .default("designer"),
  note: z.string().optional(),
  trackingRef: z.string().optional(),
  shippingNote: z.string().optional(),
  deliveryNote: z.string().optional(),
  disputeReason: z.string().optional(),
});

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const order = getEscrowOrder(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json({ order });
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = transitionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const result = transitionEscrowOrder(id, parsed.data);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ order: result });
}

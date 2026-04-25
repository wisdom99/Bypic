import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  fabricId: z.string(),
  supplierId: z.string(),
  designerName: z.string().min(1),
  designerEmail: z.string().email(),
  yardsNeeded: z.number().int().positive(),
  deadline: z.string(),
  message: z.string().min(1),
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

  const id = `RFQ-${Date.now().toString(36).toUpperCase()}-${Math.floor(
    Math.random() * 9999,
  )
    .toString()
    .padStart(4, "0")}`;

  return NextResponse.json({
    id,
    receivedAt: new Date().toISOString(),
    fabricId: parsed.data.fabricId,
    supplierId: parsed.data.supplierId,
    preferredChannel: parsed.data.preferredChannel,
  });
}

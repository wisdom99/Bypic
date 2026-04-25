import { NextResponse } from "next/server";
import { z } from "zod";
import { HERITAGES, REGIONS } from "@/lib/data";
import {
  addSupplierApplication,
  countPendingSupplierApplications,
} from "@/lib/store";
import type {
  ContactChannel,
  Heritage,
  NigerianHub,
  SupplierApplicationConfirmation,
} from "@/lib/types";

const heritageSchema = z.enum(HERITAGES as [Heritage, ...Heritage[]]);
const regionSchema = z.enum(REGIONS as [NigerianHub, ...NigerianHub[]]);
const channelSchema = z.enum(["whatsapp", "email", "phone"] as [
  ContactChannel,
  ...ContactChannel[],
]);

const currentYear = new Date().getFullYear();

const schema = z
  .object({
    workshopName: z.string().min(2).max(80),
    tagline: z.string().min(8).max(140),
    story: z.string().min(40).max(1200),
    region: regionSchema,
    established: z
      .number()
      .int()
      .min(1900)
      .max(currentYear),
    specialties: z.array(heritageSchema).min(1).max(6),
    contactName: z.string().min(2).max(80),
    email: z.string().email(),
    whatsapp: z
      .string()
      .min(7)
      .max(20)
      .optional()
      .or(z.literal("").transform(() => undefined)),
    phone: z
      .string()
      .min(7)
      .max(20)
      .optional()
      .or(z.literal("").transform(() => undefined)),
    contactChannels: z.array(channelSchema).min(1).max(3),
    preferredChannel: channelSchema,
    leadTimeMin: z.number().int().min(1).max(120),
    leadTimeMax: z.number().int().min(1).max(180),
    minOrderYards: z.number().int().min(1).max(500),
    sampleWork: z
      .string()
      .max(500)
      .optional()
      .or(z.literal("").transform(() => undefined)),
  })
  .refine((d) => d.leadTimeMax >= d.leadTimeMin, {
    message: "Max lead time must be greater than or equal to min",
    path: ["leadTimeMax"],
  })
  .refine((d) => d.contactChannels.includes(d.preferredChannel), {
    message: "Preferred channel must be one of the selected contact channels",
    path: ["preferredChannel"],
  })
  .refine(
    (d) =>
      !d.contactChannels.includes("whatsapp") ||
      (d.whatsapp && d.whatsapp.length >= 7),
    {
      message: "WhatsApp number is required when WhatsApp is a contact channel",
      path: ["whatsapp"],
    },
  )
  .refine(
    (d) =>
      !d.contactChannels.includes("phone") || (d.phone && d.phone.length >= 7),
    {
      message: "Phone number is required when phone is a contact channel",
      path: ["phone"],
    },
  );

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

  const {
    leadTimeMin,
    leadTimeMax,
    workshopName,
    tagline,
    story,
    region,
    established,
    specialties,
    contactName,
    email,
    whatsapp,
    phone,
    contactChannels,
    preferredChannel,
    minOrderYards,
    sampleWork,
  } = parsed.data;

  const application = addSupplierApplication({
    workshopName: workshopName.trim(),
    tagline: tagline.trim(),
    story: story.trim(),
    region,
    established,
    specialties,
    contactName: contactName.trim(),
    email: email.trim().toLowerCase(),
    whatsapp,
    phone,
    contactChannels,
    preferredChannel,
    leadTimeDays: [leadTimeMin, leadTimeMax],
    minOrderYards,
    sampleWork,
  });

  const queuePosition = countPendingSupplierApplications();

  const confirmation: SupplierApplicationConfirmation = {
    id: application.id,
    createdAt: application.createdAt,
    workshopName: application.workshopName,
    region: application.region,
    preferredChannel: application.preferredChannel,
    queuePosition,
    estimatedReviewDays: 3 + Math.min(7, queuePosition),
  };

  return NextResponse.json(confirmation);
}

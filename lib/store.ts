import { getFabricById, getSupplierById } from "@/lib/data";
import {
  autoReleaseAtFrom,
  canTransition,
  computeFees,
  generateOrderId,
  isPipeline,
  isRealised,
} from "@/lib/escrow";
import type {
  DemandFabricStat,
  DemandFeedItem,
  DemandHeritageStat,
  DemandMoodStat,
  DemandPaletteStat,
  DemandRegionStat,
  DemandStats,
  EscrowActor,
  EscrowCreatePayload,
  EscrowEvent,
  EscrowOrder,
  EscrowRevenueStats,
  EscrowStatus,
  Heritage,
  Interest,
  InterestPayload,
  NigerianHub,
  SupplierApplication,
  SupplierApplicationPayload,
} from "@/lib/types";

// Seeded interests are used so the demand board looks alive on first load.
// Live submissions are appended at the head. The store is process-local; on
// Vercel it resets when a new lambda spins up — acceptable for this prototype.
const SEED: Array<Omit<Interest, "id" | "createdAt"> & { hoursAgo: number }> = [
  // -- Indigo Adire is the hottest trend right now --
  {
    fabricId: "indigo-elu",
    supplierId: "adire-oodua",
    designerName: "Tola Adekunle",
    designerEmail: "studio@tola.ng",
    targetYards: 80,
    neededBy: daysFromNow(35),
    note: "Lookbook capsule for Lagos Fashion Week. Indigo only.",
    preferredChannel: "whatsapp",
    hoursAgo: 4,
  },
  {
    fabricId: "indigo-elu",
    supplierId: "adire-oodua",
    designerName: "Ifeoma Obi",
    designerEmail: "ife@obi.studio",
    targetYards: 45,
    neededBy: daysFromNow(28),
    note: "Bridal coordinates, 12 looks.",
    preferredChannel: "email",
    hoursAgo: 18,
  },
  {
    fabricId: "indigo-laali",
    supplierId: "ibadan-dye-works",
    designerName: "Adaeze Eze",
    designerEmail: "ada@ezeatelier.com",
    targetYards: 36,
    neededBy: daysFromNow(45),
    preferredChannel: "whatsapp",
    hoursAgo: 30,
  },
  {
    fabricId: "indigo-osun",
    supplierId: "ibadan-dye-works",
    designerName: "Bisi Akande",
    designerEmail: "bisi@bisiakande.co",
    targetYards: 60,
    neededBy: daysFromNow(40),
    note: "Exploring osun + indigo overdye for SS26.",
    preferredChannel: "email",
    hoursAgo: 50,
  },
  {
    fabricId: "moon-adire",
    supplierId: "adire-oodua",
    designerName: "Halima Yusuf",
    designerEmail: "halima@hyatelier.com",
    targetYards: 24,
    neededBy: daysFromNow(21),
    preferredChannel: "phone",
    hoursAgo: 3,
  },
  {
    fabricId: "indigo-river",
    supplierId: "ibadan-dye-works",
    designerName: "Chiamaka Nwosu",
    designerEmail: "ck@nwosu.studio",
    targetYards: 50,
    neededBy: daysFromNow(60),
    preferredChannel: "email",
    hoursAgo: 72,
  },
  {
    fabricId: "indigo-elu",
    supplierId: "adire-oodua",
    designerName: "Yemi Bakare",
    designerEmail: "yemi@bakare.ng",
    targetYards: 18,
    neededBy: daysFromNow(14),
    preferredChannel: "whatsapp",
    hoursAgo: 90,
  },

  // -- Ceremonial Aso-oke demand spike (wedding season) --
  {
    fabricId: "alaari-aso",
    supplierId: "aso-iwofa",
    designerName: "Funmi Olatunji",
    designerEmail: "funmi@olatunjicouture.com",
    targetYards: 32,
    neededBy: daysFromNow(50),
    note: "Bridal alaari + gele set, 8 brides booked.",
    preferredChannel: "whatsapp",
    hoursAgo: 6,
  },
  {
    fabricId: "alaari-aso",
    supplierId: "aso-iwofa",
    designerName: "Kemi Sule",
    designerEmail: "kemi@sulebridal.com",
    targetYards: 22,
    neededBy: daysFromNow(38),
    preferredChannel: "phone",
    hoursAgo: 26,
  },
  {
    fabricId: "sanyan-aso",
    supplierId: "aso-iwofa",
    designerName: "Olu Adesanya",
    designerEmail: "olu@adesanya.co",
    targetYards: 16,
    neededBy: daysFromNow(70),
    note: "Heritage capsule, willing to wait.",
    preferredChannel: "email",
    hoursAgo: 44,
  },
  {
    fabricId: "etu-aso",
    supplierId: "aso-iwofa",
    designerName: "Damilola Owo",
    designerEmail: "dami@dowostudio.com",
    targetYards: 28,
    neededBy: daysFromNow(42),
    preferredChannel: "whatsapp",
    hoursAgo: 12,
  },

  // -- Akwete steady demand --
  {
    fabricId: "akwete-ikaki",
    supplierId: "akwete-mma",
    designerName: "Ngozi Okeke",
    designerEmail: "ngozi@okeke.studio",
    targetYards: 24,
    neededBy: daysFromNow(45),
    preferredChannel: "email",
    hoursAgo: 22,
  },
  {
    fabricId: "akwete-onwe",
    supplierId: "akwete-mma",
    designerName: "Chinwe Iroh",
    designerEmail: "chinwe@irohatelier.com",
    targetYards: 20,
    neededBy: daysFromNow(55),
    preferredChannel: "whatsapp",
    hoursAgo: 38,
  },
  {
    fabricId: "akwete-ivory",
    supplierId: "akwete-mma",
    designerName: "Tara Ade",
    designerEmail: "tara@ade.ng",
    targetYards: 14,
    neededBy: daysFromNow(30),
    preferredChannel: "email",
    hoursAgo: 70,
  },

  // -- Ankara casual demand --
  {
    fabricId: "ankara-orchid",
    supplierId: "balogun-textiles",
    designerName: "Sade Bello",
    designerEmail: "sade@bellostudio.com",
    targetYards: 60,
    neededBy: daysFromNow(20),
    preferredChannel: "whatsapp",
    hoursAgo: 8,
  },
  {
    fabricId: "ankara-emerald",
    supplierId: "balogun-textiles",
    designerName: "Zainab Bala",
    designerEmail: "zainab@balaclothing.com",
    targetYards: 40,
    neededBy: daysFromNow(25),
    preferredChannel: "whatsapp",
    hoursAgo: 16,
  },
  {
    fabricId: "ankara-saffron",
    supplierId: "balogun-textiles",
    designerName: "Rita Eze",
    designerEmail: "rita@ezeready.com",
    targetYards: 30,
    neededBy: daysFromNow(18),
    preferredChannel: "email",
    hoursAgo: 34,
  },
  {
    fabricId: "ankara-monsoon",
    supplierId: "balogun-textiles",
    designerName: "Mary Adeleke",
    designerEmail: "mary@adeleke.ng",
    targetYards: 25,
    neededBy: daysFromNow(22),
    preferredChannel: "whatsapp",
    hoursAgo: 80,
  },

  // -- Kente / Lace / Linen / Cotton --
  {
    fabricId: "kente-bonwire",
    supplierId: "kente-bridge",
    designerName: "Akua Mensah",
    designerEmail: "akua@mensah.gh",
    targetYards: 20,
    neededBy: daysFromNow(60),
    preferredChannel: "email",
    hoursAgo: 48,
  },
  {
    fabricId: "kente-emerald",
    supplierId: "kente-bridge",
    designerName: "Kwame Boateng",
    designerEmail: "kwame@boatengwear.com",
    targetYards: 14,
    neededBy: daysFromNow(40),
    preferredChannel: "whatsapp",
    hoursAgo: 110,
  },
  {
    fabricId: "lace-pearl",
    supplierId: "onitsha-lace",
    designerName: "Vivian Eze",
    designerEmail: "viv@vivianeze.com",
    targetYards: 30,
    neededBy: daysFromNow(28),
    preferredChannel: "whatsapp",
    hoursAgo: 14,
  },
  {
    fabricId: "lace-rosewater",
    supplierId: "onitsha-lace",
    designerName: "Fatima Bello",
    designerEmail: "fatima@bellobridal.com",
    targetYards: 26,
    neededBy: daysFromNow(35),
    preferredChannel: "email",
    hoursAgo: 60,
  },
  {
    fabricId: "linen-coral",
    supplierId: "lagos-linen-lab",
    designerName: "Tunde Bakare",
    designerEmail: "tunde@bakareresort.com",
    targetYards: 80,
    neededBy: daysFromNow(15),
    preferredChannel: "email",
    hoursAgo: 10,
  },
  {
    fabricId: "linen-sage",
    supplierId: "lagos-linen-lab",
    designerName: "Mide Olu",
    designerEmail: "mide@olu.studio",
    targetYards: 50,
    neededBy: daysFromNow(20),
    preferredChannel: "whatsapp",
    hoursAgo: 28,
  },
  {
    fabricId: "kola-rust",
    supplierId: "ibadan-dye-works",
    designerName: "Abiola Salami",
    designerEmail: "abiola@salamicouture.com",
    targetYards: 35,
    neededBy: daysFromNow(48),
    preferredChannel: "email",
    hoursAgo: 56,
  },
];

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function generateId(): string {
  return `INT-${Date.now().toString(36).toUpperCase()}-${Math.floor(
    Math.random() * 9999,
  )
    .toString()
    .padStart(4, "0")}`;
}

// Module-level mutable store. Persists for the lifetime of the server process.
const interests: Interest[] = SEED.map((seed, idx) => {
  const created = new Date();
  created.setHours(created.getHours() - seed.hoursAgo);
  // Use a stable id derived from index so server renders are deterministic.
  return {
    id: `INT-SEED-${(idx + 1).toString().padStart(3, "0")}`,
    createdAt: created.toISOString(),
    fabricId: seed.fabricId,
    supplierId: seed.supplierId,
    designerName: seed.designerName,
    designerEmail: seed.designerEmail,
    targetYards: seed.targetYards,
    neededBy: seed.neededBy,
    note: seed.note,
    preferredChannel: seed.preferredChannel,
  };
});

export function addInterest(payload: InterestPayload): Interest {
  const interest: Interest = {
    ...payload,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  interests.unshift(interest);
  return interest;
}

export function listInterests(): Interest[] {
  return interests;
}

function toFeedItem(i: Interest): DemandFeedItem | null {
  const fabric = getFabricById(i.fabricId);
  if (!fabric) return null;
  const supplier = getSupplierById(i.supplierId);
  const initials =
    i.designerName
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "—";
  return {
    id: i.id,
    createdAt: i.createdAt,
    designerInitials: initials,
    designerEmail: i.designerEmail,
    fabricId: fabric.id,
    fabricName: fabric.name,
    supplierId: fabric.supplierId,
    supplierName: supplier?.name ?? "Unknown supplier",
    heritage: fabric.heritage,
    region: fabric.region,
    palette: fabric.palette,
    moodTags: fabric.moodTags,
    inStockYards: fabric.inStockYards,
    minOrderYards: fabric.minOrderYards,
    yards: i.targetYards,
    neededBy: i.neededBy,
  };
}

export function getDemandFeed(): DemandFeedItem[] {
  return interests
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .map(toFeedItem)
    .filter((x): x is DemandFeedItem => x !== null);
}

export function countInterestsForFabric(fabricId: string): {
  count: number;
  yards: number;
} {
  let count = 0;
  let yards = 0;
  for (const i of interests) {
    if (i.fabricId === fabricId) {
      count += 1;
      yards += i.targetYards;
    }
  }
  return { count, yards };
}

export function getDemandStats(windowDays = 90): DemandStats {
  const since = new Date();
  since.setDate(since.getDate() - windowDays);
  const inWindow = interests.filter(
    (i) => new Date(i.createdAt).getTime() >= since.getTime(),
  );

  const heritageMap = new Map<Heritage, DemandHeritageStat>();
  const regionMap = new Map<NigerianHub, DemandRegionStat>();
  const fabricMap = new Map<string, DemandFabricStat>();
  const moodMap = new Map<string, number>();
  const paletteMap = new Map<string, number>();
  const heritageDesigners = new Map<Heritage, Set<string>>();
  const designers = new Set<string>();
  let totalYards = 0;

  for (const i of inWindow) {
    const fabric = getFabricById(i.fabricId);
    if (!fabric) continue;
    const supplier = getSupplierById(i.supplierId);
    designers.add(i.designerEmail.toLowerCase());
    totalYards += i.targetYards;

    const h = heritageMap.get(fabric.heritage) ?? {
      heritage: fabric.heritage,
      interests: 0,
      yards: 0,
      designers: 0,
    };
    h.interests += 1;
    h.yards += i.targetYards;
    heritageMap.set(fabric.heritage, h);
    if (!heritageDesigners.has(fabric.heritage)) {
      heritageDesigners.set(fabric.heritage, new Set());
    }
    heritageDesigners.get(fabric.heritage)!.add(i.designerEmail.toLowerCase());

    const r = regionMap.get(fabric.region) ?? {
      region: fabric.region,
      interests: 0,
      yards: 0,
    };
    r.interests += 1;
    r.yards += i.targetYards;
    regionMap.set(fabric.region, r);

    const f = fabricMap.get(fabric.id) ?? {
      fabricId: fabric.id,
      fabricName: fabric.name,
      supplierId: fabric.supplierId,
      supplierName: supplier?.name ?? "Unknown supplier",
      heritage: fabric.heritage,
      region: fabric.region,
      palette: fabric.palette,
      inStockYards: fabric.inStockYards,
      minOrderYards: fabric.minOrderYards,
      interests: 0,
      yards: 0,
      earliestDeadline: null as string | null,
      shortfall: 0,
    };
    f.interests += 1;
    f.yards += i.targetYards;
    if (
      f.earliestDeadline === null ||
      new Date(i.neededBy).getTime() < new Date(f.earliestDeadline).getTime()
    ) {
      f.earliestDeadline = i.neededBy;
    }
    fabricMap.set(fabric.id, f);

    for (const tag of fabric.moodTags) {
      moodMap.set(tag, (moodMap.get(tag) ?? 0) + 1);
    }
    fabric.palette.slice(0, 3).forEach((hex, idx) => {
      // Weight earlier (more dominant) palette colors more heavily.
      const weight = i.targetYards * (1 - idx * 0.25);
      paletteMap.set(hex, (paletteMap.get(hex) ?? 0) + weight);
    });
  }

  for (const [heritage, set] of heritageDesigners) {
    const stat = heritageMap.get(heritage);
    if (stat) stat.designers = set.size;
  }

  const byFabric = Array.from(fabricMap.values())
    .map((f) => ({
      ...f,
      shortfall: Math.max(0, f.yards - f.inStockYards),
    }))
    .sort((a, b) => b.interests - a.interests || b.yards - a.yards);

  const byHeritage = Array.from(heritageMap.values()).sort(
    (a, b) => b.interests - a.interests,
  );
  const byRegion = Array.from(regionMap.values()).sort(
    (a, b) => b.interests - a.interests,
  );
  const trendingMoods = Array.from(moodMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  const trendingPalette = Array.from(paletteMap.entries())
    .map(([hex, weight]) => ({ hex, weight: Math.round(weight) }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 12);

  const recent: DemandFeedItem[] = inWindow
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .map(toFeedItem)
    .filter((x): x is DemandFeedItem => x !== null);

  return {
    totalInterests: inWindow.length,
    totalYards,
    uniqueDesigners: designers.size,
    windowDays,
    byHeritage,
    byRegion,
    byFabric,
    trendingMoods,
    trendingPalette,
    recent,
  };
}

// --- Supplier verification queue ----------------------------------------
//
// New producers apply via /suppliers/register. We hold the applications in a
// process-local queue so the prototype can show queue depth, recent regions,
// etc. without standing up a database. Like `interests`, this resets when a
// new lambda spins up — fine for a hackathon demo.
const SUPPLIER_APPLICATION_SEED: Array<
  Omit<SupplierApplication, "id" | "createdAt"> & { hoursAgo: number }
> = [
  {
    workshopName: "Itoku Indigo Collective",
    tagline: "Third-generation Adire dyers from Itoku market",
    story:
      "A six-woman cooperative producing tie-resist and stencil Adire on hand-loomed cotton. Looking to graduate from market-stall sales to direct designer orders.",
    region: "Abeokuta",
    established: 2007,
    specialties: ["Adire", "Cotton"],
    contactName: "Mama Sekinat Ogunlade",
    email: "sekinat@itokuindigo.ng",
    whatsapp: "+2348065556677",
    contactChannels: ["whatsapp", "email"],
    preferredChannel: "whatsapp",
    leadTimeDays: [6, 10],
    minOrderYards: 6,
    status: "scheduled",
    hoursAgo: 6,
  },
  {
    workshopName: "Aba Loom House",
    tagline: "Akwete handweave with contemporary palettes",
    story:
      "Two-loom studio reviving ikaki and ebe motifs in modern colour stories. Already supplying two Lagos couture houses informally.",
    region: "Aba",
    established: 2019,
    specialties: ["Akwete", "Cotton"],
    contactName: "Chinyere Eze",
    email: "studio@abaloomhouse.ng",
    whatsapp: "+2348091234567",
    contactChannels: ["whatsapp", "email"],
    preferredChannel: "email",
    leadTimeDays: [10, 16],
    minOrderYards: 4,
    status: "pending",
    hoursAgo: 22,
  },
  {
    workshopName: "Kofar Mata Cotton",
    tagline: "Hausa pit-dye indigo + handloom cotton",
    story:
      "Family-run dye pit operating since 1953 alongside a cotton handloom floor in Dala. Want to formalise lead times and grow beyond traders.",
    region: "Kano",
    established: 1953,
    specialties: ["Cotton", "Adire"],
    contactName: "Yusuf Sani",
    email: "yusuf@kofarmata.ng",
    whatsapp: "+2348072223344",
    phone: "+2348072223344",
    contactChannels: ["phone", "whatsapp"],
    preferredChannel: "phone",
    leadTimeDays: [9, 14],
    minOrderYards: 8,
    status: "pending",
    hoursAgo: 38,
  },
];

const supplierApplications: SupplierApplication[] = SUPPLIER_APPLICATION_SEED.map(
  (seed, idx) => {
    const created = new Date();
    created.setHours(created.getHours() - seed.hoursAgo);
    const { hoursAgo: _hoursAgo, ...rest } = seed;
    void _hoursAgo;
    return {
      ...rest,
      id: `SUP-SEED-${(idx + 1).toString().padStart(3, "0")}`,
      createdAt: created.toISOString(),
    };
  },
);

function generateApplicationId(): string {
  return `SUP-${Date.now().toString(36).toUpperCase()}-${Math.floor(
    Math.random() * 9999,
  )
    .toString()
    .padStart(4, "0")}`;
}

export function addSupplierApplication(
  payload: SupplierApplicationPayload,
): SupplierApplication {
  const application: SupplierApplication = {
    ...payload,
    id: generateApplicationId(),
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  supplierApplications.unshift(application);
  return application;
}

export function listSupplierApplications(): SupplierApplication[] {
  return supplierApplications.slice();
}

export function countPendingSupplierApplications(): number {
  return supplierApplications.filter((a) => a.status === "pending").length;
}

// --- Escrow store -------------------------------------------------------
//
// In-memory escrow ledger. Seeded with a handful of orders across every
// state so the dashboard, timeline, and revenue tiles look alive on first
// load. Like the other stores in this file it's process-local — fine for
// a hackathon prototype, swap for Postgres + Stripe Connect in production.

interface EscrowSeed {
  fabricId: string;
  designerName: string;
  designerEmail: string;
  yards: number;
  status: EscrowStatus;
  hoursAgo: number;
  trackingRef?: string;
  shippingNote?: string;
  deliveryNote?: string;
  disputeReason?: string;
}

const ESCROW_SEED: EscrowSeed[] = [
  {
    fabricId: "indigo-elu",
    designerName: "Tola Adekunle",
    designerEmail: "studio@tola.ng",
    yards: 32,
    status: "released",
    hoursAgo: 240,
    trackingRef: "GIG-LOS-88421",
    shippingNote: "DHL Lagos hub → Victoria Island.",
    deliveryNote: "Beautiful indigo, exactly the swatch we approved.",
  },
  {
    fabricId: "alaari-aso",
    designerName: "Funmi Olatunji",
    designerEmail: "funmi@olatunjicouture.com",
    yards: 24,
    status: "released",
    hoursAgo: 168,
    trackingRef: "RED-IBN-22019",
    deliveryNote: "Loom width spot-on. Will reorder for the next bridal drop.",
  },
  {
    fabricId: "linen-coral",
    designerName: "Tunde Bakare",
    designerEmail: "tunde@bakareresort.com",
    yards: 60,
    status: "delivered",
    hoursAgo: 30,
    trackingRef: "GIG-LOS-90112",
    deliveryNote: "Received and inspected. 7-day window running.",
  },
  {
    fabricId: "akwete-ikaki",
    designerName: "Ngozi Okeke",
    designerEmail: "ngozi@okeke.studio",
    yards: 18,
    status: "shipped",
    hoursAgo: 8,
    trackingRef: "ABC-ABA-44551",
    shippingNote: "Aba → Lagos via ABC Transport, ETA Friday.",
  },
  {
    fabricId: "ankara-orchid",
    designerName: "Sade Bello",
    designerEmail: "sade@bellostudio.com",
    yards: 40,
    status: "funded",
    hoursAgo: 4,
  },
  {
    fabricId: "moon-adire",
    designerName: "Halima Yusuf",
    designerEmail: "halima@hyatelier.com",
    yards: 12,
    status: "pending",
    hoursAgo: 1,
  },
  {
    fabricId: "kente-bonwire",
    designerName: "Akua Mensah",
    designerEmail: "akua@mensah.gh",
    yards: 14,
    status: "disputed",
    hoursAgo: 56,
    trackingRef: "DHL-ACC-71203",
    shippingNote: "Accra → Lagos via DHL.",
    disputeReason: "Two yards short of the agreed cut. Awaiting producer reply.",
  },
];

function buildSeedOrder(seed: EscrowSeed, idx: number): EscrowOrder | null {
  const fabric = getFabricById(seed.fabricId);
  if (!fabric) return null;
  const supplier = getSupplierById(fabric.supplierId);
  if (!supplier) return null;
  const fees = computeFees(seed.yards, fabric.pricePerYardNgn);
  const created = new Date();
  created.setHours(created.getHours() - seed.hoursAgo);
  const id = `ESC-SEED-${(idx + 1).toString().padStart(3, "0")}`;

  // Build a plausible event log for each seeded state. Each step is offset
  // backwards from `seed.hoursAgo` so timelines render in the right order.
  const events: EscrowEvent[] = [];
  const stamp = (hoursAgo: number): string => {
    const d = new Date();
    d.setHours(d.getHours() - hoursAgo);
    return d.toISOString();
  };
  const order: EscrowOrder = {
    id,
    fabricId: fabric.id,
    fabricName: fabric.name,
    heritage: fabric.heritage,
    region: fabric.region,
    palette: fabric.palette,
    supplierId: supplier.id,
    supplierName: supplier.name,
    designerName: seed.designerName,
    designerEmail: seed.designerEmail,
    yards: seed.yards,
    pricePerYardNgn: fabric.pricePerYardNgn,
    fees,
    status: seed.status,
    createdAt: stamp(seed.hoursAgo),
    trackingRef: seed.trackingRef,
    shippingNote: seed.shippingNote,
    deliveryNote: seed.deliveryNote,
    disputeReason: seed.disputeReason,
    events,
  };

  events.push({
    at: order.createdAt,
    status: "pending",
    actor: "designer",
    note: "Order drafted with the producer.",
  });

  if (seed.status === "pending") return order;

  const fundedHoursAgo = Math.max(0, seed.hoursAgo - 1);
  order.fundedAt = stamp(fundedHoursAgo);
  events.push({
    at: order.fundedAt,
    status: "funded",
    actor: "designer",
    note: "Designer funded escrow. Threadline is holding the funds.",
  });

  if (seed.status === "funded") return order;

  const shippedHoursAgo = Math.max(0, fundedHoursAgo - 6);
  order.shippedAt = stamp(shippedHoursAgo);
  events.push({
    at: order.shippedAt,
    status: "shipped",
    actor: "producer",
    note: seed.shippingNote ?? "Producer marked the order shipped.",
  });

  if (seed.status === "shipped") return order;

  if (seed.status === "disputed") {
    order.disputedAt = stamp(Math.max(0, shippedHoursAgo - 6));
    events.push({
      at: order.disputedAt,
      status: "disputed",
      actor: "designer",
      note: seed.disputeReason ?? "Designer raised a dispute.",
    });
    return order;
  }

  const deliveredHoursAgo = Math.max(0, shippedHoursAgo - 18);
  order.deliveredAt = stamp(deliveredHoursAgo);
  order.autoReleaseAt = autoReleaseAtFrom(new Date(order.deliveredAt));
  events.push({
    at: order.deliveredAt,
    status: "delivered",
    actor: "designer",
    note: seed.deliveryNote ?? "Designer confirmed receipt.",
  });

  if (seed.status === "delivered") return order;

  if (seed.status === "released") {
    const releasedHoursAgo = Math.max(0, deliveredHoursAgo - 6);
    order.releasedAt = stamp(releasedHoursAgo);
    events.push({
      at: order.releasedAt,
      status: "released",
      actor: "threadline",
      note: `Funds released to ${supplier.name}. Threadline kept ₦${fees.totalFeeNgn.toLocaleString("en-NG")} (${(
        (fees.totalFeeNgn / fees.subtotalNgn) *
        100
      ).toFixed(1)}%).`,
    });
    return order;
  }

  return order;
}

const escrowOrders: EscrowOrder[] = ESCROW_SEED.map(buildSeedOrder).filter(
  (o): o is EscrowOrder => o !== null,
);

export function listEscrowOrders(): EscrowOrder[] {
  return escrowOrders
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export function getEscrowOrder(id: string): EscrowOrder | undefined {
  return escrowOrders.find((o) => o.id === id);
}

export function createEscrowOrder(
  payload: EscrowCreatePayload,
): EscrowOrder | { error: string } {
  const fabric = getFabricById(payload.fabricId);
  if (!fabric) return { error: "Fabric not found" };
  const supplier = getSupplierById(fabric.supplierId);
  if (!supplier) return { error: "Supplier not found" };
  if (payload.yards < fabric.minOrderYards) {
    return {
      error: `Below minimum order — ${fabric.name} requires ${fabric.minOrderYards} yards.`,
    };
  }

  const fees = computeFees(payload.yards, fabric.pricePerYardNgn);
  const now = new Date().toISOString();
  const order: EscrowOrder = {
    id: generateOrderId(),
    fabricId: fabric.id,
    fabricName: fabric.name,
    heritage: fabric.heritage,
    region: fabric.region,
    palette: fabric.palette,
    supplierId: supplier.id,
    supplierName: supplier.name,
    designerName: payload.designerName,
    designerEmail: payload.designerEmail,
    yards: payload.yards,
    pricePerYardNgn: fabric.pricePerYardNgn,
    fees,
    status: "pending",
    createdAt: now,
    events: [
      {
        at: now,
        status: "pending",
        actor: "designer",
        note: "Order drafted. Awaiting payment to escrow.",
      },
    ],
  };
  escrowOrders.unshift(order);
  return order;
}

interface TransitionPayload {
  to: EscrowStatus;
  actor: EscrowActor;
  note?: string;
  trackingRef?: string;
  shippingNote?: string;
  deliveryNote?: string;
  disputeReason?: string;
}

export function transitionEscrowOrder(
  id: string,
  payload: TransitionPayload,
): EscrowOrder | { error: string } {
  const order = escrowOrders.find((o) => o.id === id);
  if (!order) return { error: "Order not found" };
  if (!canTransition(order.status, payload.to)) {
    return {
      error: `Cannot move from ${order.status} to ${payload.to}`,
    };
  }

  const now = new Date().toISOString();
  order.status = payload.to;
  order.events.push({
    at: now,
    status: payload.to,
    actor: payload.actor,
    note: payload.note,
  });

  switch (payload.to) {
    case "funded":
      order.fundedAt = now;
      break;
    case "shipped":
      order.shippedAt = now;
      if (payload.trackingRef) order.trackingRef = payload.trackingRef;
      if (payload.shippingNote) order.shippingNote = payload.shippingNote;
      break;
    case "delivered":
      order.deliveredAt = now;
      order.autoReleaseAt = autoReleaseAtFrom(new Date(now));
      if (payload.deliveryNote) order.deliveryNote = payload.deliveryNote;
      break;
    case "released":
      order.releasedAt = now;
      break;
    case "disputed":
      order.disputedAt = now;
      if (payload.disputeReason) order.disputeReason = payload.disputeReason;
      break;
    case "refunded":
      order.refundedAt = now;
      break;
    case "cancelled":
      order.cancelledAt = now;
      break;
  }

  return order;
}

export function getEscrowRevenueStats(): EscrowRevenueStats {
  const countByStatus: Record<EscrowStatus, number> = {
    pending: 0,
    funded: 0,
    shipped: 0,
    delivered: 0,
    released: 0,
    disputed: 0,
    refunded: 0,
    cancelled: 0,
  };
  let totalGmvNgn = 0;
  let fundsHeldNgn = 0;
  let paidOutNgn = 0;
  let platformRevenueNgn = 0;
  let pipelineRevenueNgn = 0;

  for (const o of escrowOrders) {
    countByStatus[o.status] += 1;
    if (
      o.status === "pending" ||
      o.status === "cancelled" ||
      o.status === "refunded"
    ) {
      // Pending and refunded orders don't count toward GMV.
      // Refunded shows up in countByStatus only.
      continue;
    }
    totalGmvNgn += o.fees.subtotalNgn;
    if (isPipeline(o.status)) {
      fundsHeldNgn += o.fees.totalChargedNgn;
      pipelineRevenueNgn += o.fees.totalFeeNgn;
    }
    if (isRealised(o.status)) {
      paidOutNgn += o.fees.producerPayoutNgn;
      platformRevenueNgn += o.fees.totalFeeNgn;
    }
  }

  return {
    totalOrders: escrowOrders.length,
    totalGmvNgn,
    fundsHeldNgn,
    paidOutNgn,
    platformRevenueNgn,
    pipelineRevenueNgn,
    countByStatus,
  };
}

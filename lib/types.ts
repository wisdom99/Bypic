export type Heritage =
  | "Ankara"
  | "Adire"
  | "Aso-oke"
  | "Akwete"
  | "Kente"
  | "Lace"
  | "Cotton"
  | "Linen";

export type NigerianHub =
  | "Lagos"
  | "Aba"
  | "Kano"
  | "Onitsha"
  | "Abeokuta"
  | "Ibadan";

export type ContactChannel = "whatsapp" | "email" | "phone";

export interface Supplier {
  id: string;
  name: string;
  tagline: string;
  story: string;
  region: NigerianHub;
  established: number;
  verified: boolean;
  specialties: Heritage[];
  contactChannels: ContactChannel[];
  whatsapp?: string;
  email?: string;
  leadTimeDays: [number, number];
  minOrderYards: number;
  rating: number;
  ordersFulfilled: number;
  cover: string;
  avatarColor: string;
}

export interface Fabric {
  id: string;
  name: string;
  supplierId: string;
  heritage: Heritage;
  fabricType: string;
  description: string;
  pricePerYardNgn: number;
  minOrderYards: number;
  inStockYards: number;
  leadTimeDays: number;
  region: NigerianHub;
  palette: string[];
  moodTags: string[];
  textureTags: string[];
  weight: "lightweight" | "midweight" | "heavyweight";
  composition: string;
  image: string;
  gallery?: string[];
  featured?: boolean;
}

export interface MatchVisionResult {
  dominantColors: string[];
  moodTags: string[];
  textureHints: string[];
  suggestedFabricTypes: Heritage[];
  summary: string;
}

export interface MatchResult {
  fabric: Fabric;
  supplier: Supplier;
  score: number;
  reasoning: string;
  breakdown: {
    color: number;
    mood: number;
    fabricType: number;
    texture: number;
  };
}

export interface InquiryPayload {
  fabricId: string;
  supplierId: string;
  designerName: string;
  designerEmail: string;
  yardsNeeded: number;
  deadline: string;
  message: string;
  preferredChannel: ContactChannel;
}

export interface InquiryConfirmation {
  id: string;
  receivedAt: string;
  fabricId: string;
  supplierId: string;
  preferredChannel: ContactChannel;
}

export interface InterestPayload {
  fabricId: string;
  supplierId: string;
  designerName: string;
  designerEmail: string;
  targetYards: number;
  neededBy: string;
  note?: string;
  preferredChannel: ContactChannel;
}

export interface Interest extends InterestPayload {
  id: string;
  createdAt: string;
}

export interface InterestConfirmation {
  id: string;
  createdAt: string;
  fabricId: string;
  supplierId: string;
  fabricName: string;
  supplierName: string;
  matchedDemand: number;
  matchedYards: number;
}

export interface DemandHeritageStat {
  heritage: Heritage;
  interests: number;
  yards: number;
  designers: number;
}

export interface DemandRegionStat {
  region: NigerianHub;
  interests: number;
  yards: number;
}

export interface DemandFabricStat {
  fabricId: string;
  fabricName: string;
  supplierId: string;
  supplierName: string;
  heritage: Heritage;
  region: NigerianHub;
  palette: string[];
  inStockYards: number;
  minOrderYards: number;
  interests: number;
  yards: number;
  earliestDeadline: string | null;
  shortfall: number;
}

export interface DemandMoodStat {
  tag: string;
  count: number;
}

export interface DemandPaletteStat {
  hex: string;
  weight: number;
}

export interface DemandFeedItem {
  id: string;
  createdAt: string;
  designerInitials: string;
  designerEmail: string;
  designerCity?: string;
  fabricId: string;
  fabricName: string;
  supplierId: string;
  supplierName: string;
  heritage: Heritage;
  region: NigerianHub;
  palette: string[];
  moodTags: string[];
  inStockYards: number;
  minOrderYards: number;
  yards: number;
  neededBy: string;
}

export interface DemandStats {
  totalInterests: number;
  totalYards: number;
  uniqueDesigners: number;
  windowDays: number;
  byHeritage: DemandHeritageStat[];
  byRegion: DemandRegionStat[];
  byFabric: DemandFabricStat[];
  trendingMoods: DemandMoodStat[];
  trendingPalette: DemandPaletteStat[];
  recent: DemandFeedItem[];
}

export interface SupplierApplicationPayload {
  workshopName: string;
  tagline: string;
  story: string;
  region: NigerianHub;
  established: number;
  specialties: Heritage[];
  contactName: string;
  email: string;
  whatsapp?: string;
  phone?: string;
  contactChannels: ContactChannel[];
  preferredChannel: ContactChannel;
  leadTimeDays: [number, number];
  minOrderYards: number;
  sampleWork?: string;
}

export interface SupplierApplication extends SupplierApplicationPayload {
  id: string;
  createdAt: string;
  status: "pending" | "scheduled" | "verified" | "rejected";
}

export interface SupplierApplicationConfirmation {
  id: string;
  createdAt: string;
  workshopName: string;
  region: NigerianHub;
  preferredChannel: ContactChannel;
  queuePosition: number;
  estimatedReviewDays: number;
}

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

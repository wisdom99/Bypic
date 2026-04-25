import suppliersJson from "@/data/suppliers.json";
import fabricsJson from "@/data/fabrics.json";
import type { Fabric, Heritage, NigerianHub, Supplier } from "@/lib/types";

const suppliers = suppliersJson as Supplier[];
const fabrics = fabricsJson as Fabric[];

export function getSuppliers(): Supplier[] {
  return suppliers;
}

export function getFabrics(): Fabric[] {
  return fabrics;
}

export function getFabricById(id: string): Fabric | undefined {
  return fabrics.find((f) => f.id === id);
}

export function getSupplierById(id: string): Supplier | undefined {
  return suppliers.find((s) => s.id === id);
}

export function getFabricsBySupplier(supplierId: string): Fabric[] {
  return fabrics.filter((f) => f.supplierId === supplierId);
}

export function getFeaturedFabrics(limit = 6): Fabric[] {
  return fabrics.filter((f) => f.featured).slice(0, limit);
}

export const HERITAGES: Heritage[] = [
  "Adire",
  "Ankara",
  "Aso-oke",
  "Akwete",
  "Kente",
  "Lace",
  "Cotton",
  "Linen",
];

export const REGIONS: NigerianHub[] = [
  "Lagos",
  "Aba",
  "Kano",
  "Onitsha",
  "Abeokuta",
  "Ibadan",
];

export const HERITAGE_DESCRIPTIONS: Record<Heritage, string> = {
  Adire: "Yoruba indigo resist-dye craft, Abeokuta & Ibadan",
  Ankara: "Wax-resist printed cotton, the workhorse of African fashion",
  "Aso-oke": "Hand-loomed Yoruba ceremonial strip cloth",
  Akwete: "Igbo women-led handweave from Abia State",
  Kente: "Ghanaian royal handweave, sourced via Lagos",
  Lace: "French, Swiss & Austrian lace finished in Onitsha",
  Cotton: "Locally milled and hand-loomed cotton",
  Linen: "Tropical-weight breathable linen for Lagos heat",
};

import type { Localized } from "@/shared/i18n";

export type LocalizedText = Localized<string>;

export interface Pricing {
  current: number;
  regular: number | null;
  isDiscounted: boolean;
}

export interface PairingPricing {
  current: number;
  regular: number | null;
  savings: number;
  hasSavings: boolean;
}

export interface AddOn {
  id: string;
  name: LocalizedText;
  price: number;
}

export interface Size {
  id: string;
  name: LocalizedText;
  sortOrder: number;
  pricing: Pricing;
}

export interface ProductPreview {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  image: string | null;
  availability: "in_stock" | "out_of_stock";
  badge: "top" | "new" | null;
  pricing: Pricing;
}

export interface Product extends ProductPreview {
  sortOrder: number;
  sizes: Size[];
  addOns: AddOn[];
  baristaWay: { addOns: AddOn[] } | null;
  oftenOrderedWith: ProductPreview[];
}

export interface Category {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  sortOrder: number;
  products: Product[];
}

export interface Pairing {
  id: string;
  items: [Product, Product];
  pricing: PairingPricing;
}

export interface MenuResponse {
  schemaVersion: 2;
  updatedAt: string;
  currency: string;
  categories: Category[];
  signatures: Product[];
  pairings: Pairing[];
  popup: {
    enabled: boolean;
    image: string | null;
    delaySeconds: number;
  };
}

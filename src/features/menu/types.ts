import type { Localized } from "@/shared/i18n";

export type LocalizedText = Localized<string>;
export type BadgeKind = "top" | "new";
export type Availability = "in_stock" | "out_of_stock";

export interface DisplayPrice {
  current: number;
  regular: number | null;
  isDiscounted: boolean;
}

export interface PairingPrice {
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

export interface ProductSize {
  id: string;
  name: LocalizedText;
  sortOrder: number;
  pricing: DisplayPrice;
}

export interface ProductPreview {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  image: string | null;
  availability: Availability;
  badge: BadgeKind | null;
  pricing: DisplayPrice;
}

export interface Product extends ProductPreview {
  sortOrder: number;
  sizes: ProductSize[];
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
  pricing: PairingPrice;
}

export interface PopupConfig {
  enabled: boolean;
  image: string | null;
  delaySeconds: number;
}

export interface MenuResponse {
  schemaVersion: 2;
  updatedAt: string;
  currency: string;
  categories: Category[];
  signatures: Product[];
  pairings: Pairing[];
  popup: PopupConfig;
}

// ==== Customer order state ====

export interface OrderLinePart {
  productId: string;
  sizeId?: string;
  addOnIds: string[];
}

interface OrderLineBase {
  key: string;
  refId: string;
  qty: number;
}

export type OrderLine =
  | (OrderLineBase & { kind: "item"; parts: [OrderLinePart] })
  | (OrderLineBase & { kind: "bundle"; parts: [OrderLinePart, OrderLinePart] });

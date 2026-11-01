import type { Localized } from "@/shared/i18n";

// ==== Wire types (the shape returned by GET /menu) ====

export type LocalizedText = Localized<string>;

export interface WireCategory {
  id: string;
  name: LocalizedText;
  desc: LocalizedText;
  sort: number;
}

export interface WireSize {
  id: string;
  name: LocalizedText;
  sort: number;
}

export interface WireBadge {
  id: string;
}

export interface WireAddOn {
  id: string;
  name: LocalizedText;
  price: number;
  scope: string[];
}

export interface WireProductSize {
  id: string;
  price: number;
}

export interface WireDiscount {
  type: "amount" | "percent";
  value: number;
}

export interface WireBaristaWay {
  addOns: string[];
}

export interface WireProduct {
  id: string;
  categoryId: string;
  name: LocalizedText;
  desc: LocalizedText;
  price: number;
  image: string | null;
  sort: number;
  sizes: WireProductSize[];
  badges: string[];
  discount: WireDiscount | null;
  baristaWay: WireBaristaWay | null;
  oftenOrderedWith: string[];
  inStock: boolean;
}

export interface WirePairing {
  id: string;
  items: [string, string];
  bundlePrice: number | null;
}

export interface WirePopup {
  enabled: boolean;
  image: string | null;
  delaySeconds: number;
}

export interface WireMarketing {
  signatures: string[];
  pairings: WirePairing[];
  popup: WirePopup;
}

export interface MenuDocument {
  schemaVersion: number;
  updatedAt: string;
  categories: WireCategory[];
  sizes: WireSize[];
  badges: WireBadge[];
  addOns: WireAddOn[];
  products: WireProduct[];
  marketing: WireMarketing;
}

// ==== Normalized models ====

export type BadgeKind = "top" | "new";

export interface Category {
  id: string;
  name: LocalizedText;
  desc: LocalizedText;
  sort: number;
}

export interface SizeOption {
  id: string;
  name: LocalizedText;
  sort: number;
}

export interface AddOn {
  id: string;
  name: LocalizedText;
  price: number;
}

export interface ProductSize {
  id: string;
  price: number;
}

export interface Product {
  id: string;
  categoryId: string;
  name: LocalizedText;
  desc: LocalizedText;
  price: number;
  image: string | null;
  sizes: ProductSize[];
  badge: BadgeKind | null;
  discount: WireDiscount | null;
  baristaWay: { addOnIds: string[] } | null;
  oftenOrderedWith: string[];
}

export interface Pairing {
  id: string;
  items: [Product, Product];
  bundlePrice: number;
  regularPrice: number;
  savings: number;
}

export interface PopupConfig {
  enabled: boolean;
  image: string | null;
  delaySeconds: number;
}

export interface MenuDb {
  categories: Category[];
  categoriesById: Map<string, Category>;
  sizesById: Map<string, SizeOption>;
  addOnsById: Map<string, AddOn>;
  productsById: Map<string, Product>;
  productsByCategory: Map<string, Product[]>;
  addOnsByProduct: Map<string, AddOn[]>;
  signatures: Product[];
  pairings: Pairing[];
  pairingsById: Map<string, Pairing>;
  popup: PopupConfig;
}

// ==== Order ====

export interface OrderLinePart {
  productId: string;
  sizeId?: string;
  addOnIds: string[];
}

export interface OrderLine {
  /** Deterministic signature of kind + refId + parts, so identical configurations merge into one line. */
  key: string;
  kind: "item" | "bundle";
  refId: string;
  parts: OrderLinePart[];
  qty: number;
}

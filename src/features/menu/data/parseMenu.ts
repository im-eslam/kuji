import { basePriceFor, defaultSizeId } from "../lib/pricing";
import type {
  AddOn,
  BadgeKind,
  Category,
  MenuDb,
  MenuDocument,
  Pairing,
  Product,
  SizeOption,
  WireProduct,
} from "../types";

const SCHEMA_VERSION = 1;

export class MenuSchemaError extends Error {}

function pickBadge(ids: string[]): BadgeKind | null {
  if (ids.includes("top")) return "top";
  if (ids.includes("new")) return "new";
  return null;
}

function parseProduct(wire: WireProduct, categoriesById: Map<string, Category>, sizesById: Map<string, SizeOption>): Product | null {
  if (typeof wire.id !== "string" || !categoriesById.has(wire.categoryId) || typeof wire.inStock !== "boolean") return null;
  if (typeof wire.price !== "number" || wire.price < 0) return null;

  const sizes = (wire.sizes ?? [])
    .filter((s) => sizesById.has(s.id) && typeof s.price === "number" && s.price >= 0)
    .sort((a, b) => sizesById.get(a.id)!.sort - sizesById.get(b.id)!.sort)
    .map((s) => ({ id: s.id, price: s.price }));

  const discount =
    wire.discount && (wire.discount.type === "amount" || wire.discount.type === "percent") && wire.discount.value > 0
      ? wire.discount
      : null;

  return {
    id: wire.id,
    categoryId: wire.categoryId,
    name: wire.name,
    desc: wire.desc,
    price: wire.price,
    image: wire.image,
    inStock: wire.inStock,
    sizes,
    badge: pickBadge(wire.badges ?? []),
    discount,
    baristaWay: wire.baristaWay ? { addOnIds: [...wire.baristaWay.addOns] } : null,
    oftenOrderedWith: [...(wire.oftenOrderedWith ?? [])],
  };
}

export function parseMenu(doc: MenuDocument): MenuDb {
  if (doc.schemaVersion !== SCHEMA_VERSION) {
    throw new MenuSchemaError(`Unsupported menu schema version: ${doc.schemaVersion}`);
  }

  const categories: Category[] = (doc.categories ?? [])
    .filter((c) => typeof c.id === "string" && c.name)
    .map((c) => ({ id: c.id, name: c.name, desc: c.desc, sort: c.sort }))
    .sort((a, b) => a.sort - b.sort);
  const categoriesById = new Map(categories.map((c) => [c.id, c]));

  const sizesById = new Map<string, SizeOption>(
    (doc.sizes ?? [])
      .filter((s) => typeof s.id === "string")
      .map((s) => [s.id, { id: s.id, name: s.name, sort: s.sort }]),
  );

  const addOnsById = new Map<string, AddOn>();
  const addOnsByProduct = new Map<string, AddOn[]>();
  for (const wire of doc.addOns ?? []) {
    if (typeof wire.id !== "string" || typeof wire.price !== "number" || wire.price < 0) continue;
    const addOn: AddOn = { id: wire.id, name: wire.name, price: wire.price };
    addOnsById.set(addOn.id, addOn);
    for (const productId of wire.scope ?? []) {
      const list = addOnsByProduct.get(productId) ?? [];
      list.push(addOn);
      addOnsByProduct.set(productId, list);
    }
  }

  const productsById = new Map<string, Product>();
  for (const wire of doc.products ?? []) {
    const product = parseProduct(wire, categoriesById, sizesById);
    if (product) productsById.set(product.id, product);
  }

  // Drop dangling references now that every product is known, and limit the Barista's Way to
  // add-ons that are actually valid (in scope) for that product.
  for (const product of productsById.values()) {
    product.oftenOrderedWith = product.oftenOrderedWith.filter((id) => id !== product.id && productsById.has(id));
    if (product.baristaWay) {
      const valid = new Set((addOnsByProduct.get(product.id) ?? []).map((a) => a.id));
      product.baristaWay = { addOnIds: product.baristaWay.addOnIds.filter((id) => valid.has(id)) };
    }
  }

  const sortById = new Map(doc.products.map((p) => [p.id, p.sort]));
  const productsByCategory = new Map<string, Product[]>();
  for (const product of productsById.values()) {
    const list = productsByCategory.get(product.categoryId) ?? [];
    list.push(product);
    productsByCategory.set(product.categoryId, list);
  }
  for (const list of productsByCategory.values()) {
    list.sort((a, b) => (sortById.get(a.id) ?? 0) - (sortById.get(b.id) ?? 0));
  }

  const signatures = (doc.marketing?.signatures ?? []).flatMap((id) => {
    const p = productsById.get(id);
    return p ? [p] : [];
  });

  const pairings: Pairing[] = [];
  for (const wire of doc.marketing?.pairings ?? []) {
    if (typeof wire.bundlePrice !== "number" || wire.bundlePrice < 0) continue;
    const a = productsById.get(wire.items?.[0]);
    const b = productsById.get(wire.items?.[1]);
    if (!a?.inStock || !b?.inStock) continue;
    const regularPrice = basePriceFor(a, defaultSizeId(a)) + basePriceFor(b, defaultSizeId(b));
    pairings.push({
      id: wire.id,
      items: [a, b],
      bundlePrice: wire.bundlePrice,
      regularPrice,
      savings: Math.max(0, regularPrice - wire.bundlePrice),
    });
  }
  const pairingsById = new Map(pairings.map((p) => [p.id, p]));

  const popup = {
    enabled: !!doc.marketing?.popup?.enabled,
    image: doc.marketing?.popup?.image ?? null,
    delaySeconds: Math.max(0, doc.marketing?.popup?.delaySeconds ?? 0),
  };

  return {
    categories,
    categoriesById,
    sizesById,
    addOnsById,
    productsById,
    productsByCategory,
    addOnsByProduct,
    signatures,
    pairings,
    pairingsById,
    popup,
  };
}

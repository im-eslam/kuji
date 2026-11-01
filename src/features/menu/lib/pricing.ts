import type { AddOn, OrderLine, OrderLinePart, Pairing, Product } from "../types";

// ==== Sizes ====

/** The first size by sort order, or undefined when the product has no sizes (and so no size picker). */
export function defaultSizeId(product: Product): string | undefined {
  return product.sizes[0]?.id;
}

/** The full standalone price for a size, or the product's base price when it has no sizes. There is no upcharge. */
export function basePriceFor(product: Product, sizeId: string | undefined): number {
  if (sizeId) {
    const match = product.sizes.find((s) => s.id === sizeId);
    if (match) return match.price;
  }
  return product.price;
}

/** Rounded to whole EGP. Discounts apply to the base/size price only, never to add-ons. */
export function discountedBasePrice(product: Product, base: number): number {
  const discount = product.discount;
  if (!discount) return base;
  if (discount.type === "percent") return Math.max(0, Math.round(base * (1 - discount.value / 100)));
  return Math.max(0, Math.round(base - discount.value));
}

function addOnsTotal(addOnIds: string[], addOnsById: Map<string, AddOn>): number {
  return addOnIds.reduce((sum, id) => sum + (addOnsById.get(id)?.price ?? 0), 0);
}

/** What one unit of this configuration costs now (discount applied, add-ons never discounted). */
export function partUnitPrice(product: Product, part: OrderLinePart, addOnsById: Map<string, AddOn>): number {
  const base = basePriceFor(product, part.sizeId);
  return discountedBasePrice(product, base) + addOnsTotal(part.addOnIds, addOnsById);
}

/** The regular (pre-discount) unit price, for the struck-through price. Null when there is no discount to show. */
export function partRegularPrice(product: Product, part: OrderLinePart, addOnsById: Map<string, AddOn>): number | null {
  if (!product.discount) return null;
  const base = basePriceFor(product, part.sizeId);
  return base + addOnsTotal(part.addOnIds, addOnsById);
}

/** A bundle's current unit price: bundlePrice replaces the sum of the regular prices, add-ons are added on top. */
export function bundleUnitPrice(pairing: Pairing, parts: [OrderLinePart, OrderLinePart], addOnsById: Map<string, AddOn>): number {
  const addOns = parts[0].addOnIds.concat(parts[1].addOnIds);
  return pairing.bundlePrice + addOnsTotal(addOns, addOnsById);
}

export function bundleRegularPrice(pairing: Pairing, parts: [OrderLinePart, OrderLinePart], addOnsById: Map<string, AddOn>): number {
  const addOns = parts[0].addOnIds.concat(parts[1].addOnIds);
  return pairing.regularPrice + addOnsTotal(addOns, addOnsById);
}

// ==== Order lines ====

/** A deterministic signature of kind + ref + exact configuration, so identical lines merge instead of duplicating. */
export function lineKey(kind: "item" | "bundle", refId: string, parts: OrderLinePart[]): string {
  const partKey = (p: OrderLinePart) => `${p.productId}:${p.sizeId ?? ""}:${[...p.addOnIds].sort().join(",")}`;
  return `${kind}:${refId}:${parts.map(partKey).join("|")}`;
}

export function makeLine(kind: "item" | "bundle", refId: string, parts: OrderLinePart[], qty: number): OrderLine {
  return { key: lineKey(kind, refId, parts), kind, refId, parts, qty };
}

/** This line's unit price now, resolving against the catalog. */
export function lineUnitPrice(
  line: OrderLine,
  productsById: Map<string, Product>,
  pairingsById: Map<string, Pairing>,
  addOnsById: Map<string, AddOn>,
): number | null {
  if (line.kind === "item") {
    const product = productsById.get(line.parts[0].productId);
    return product ? partUnitPrice(product, line.parts[0], addOnsById) : null;
  }
  const pairing = pairingsById.get(line.refId);
  if (!pairing) return null;
  return bundleUnitPrice(pairing, [line.parts[0], line.parts[1]], addOnsById);
}

export function lineRegularPrice(
  line: OrderLine,
  productsById: Map<string, Product>,
  pairingsById: Map<string, Pairing>,
  addOnsById: Map<string, AddOn>,
): number | null {
  if (line.kind === "item") {
    const product = productsById.get(line.parts[0].productId);
    return product ? partRegularPrice(product, line.parts[0], addOnsById) : null;
  }
  const pairing = pairingsById.get(line.refId);
  if (!pairing) return null;
  const regular = bundleRegularPrice(pairing, [line.parts[0], line.parts[1]], addOnsById);
  const unit = bundleUnitPrice(pairing, [line.parts[0], line.parts[1]], addOnsById);
  return regular > unit ? regular : null;
}

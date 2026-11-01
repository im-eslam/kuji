import { findPairing, findProduct } from "./catalog";
import type {
  MenuResponse,
  OrderLine,
  OrderLinePart,
  Pairing,
  Product,
} from "../types";

export function defaultSizeId(product: Product): string | undefined {
  return product.sizes[0]?.id;
}

export function currentPriceFor(product: Product, sizeId?: string): number {
  return (
    product.sizes.find((size) => size.id === sizeId)?.pricing.current ??
    product.pricing.current
  );
}

export function regularPriceFor(
  product: Product,
  sizeId?: string,
): number | null {
  const size = product.sizes.find((item) => item.id === sizeId);
  return size ? size.pricing.regular : product.pricing.regular;
}

function addOnsTotal(product: Product, addOnIds: string[]): number {
  return addOnIds.reduce(
    (sum, id) =>
      sum + (product.addOns.find((addOn) => addOn.id === id)?.price ?? 0),
    0,
  );
}

export function partUnitPrice(product: Product, part: OrderLinePart): number {
  return (
    currentPriceFor(product, part.sizeId) + addOnsTotal(product, part.addOnIds)
  );
}

export function partRegularPrice(
  product: Product,
  part: OrderLinePart,
): number | null {
  const regular = regularPriceFor(product, part.sizeId);
  return regular === null
    ? null
    : regular + addOnsTotal(product, part.addOnIds);
}

export function bundleUnitPrice(
  pairing: Pairing,
  parts: [OrderLinePart, OrderLinePart],
): number {
  const sizeAdjustments = parts.reduce((sum, part, index) => {
    const product = pairing.items[index];
    return (
      sum + currentPriceFor(product, part.sizeId) - product.pricing.current
    );
  }, 0);
  return (
    pairing.pricing.current +
    sizeAdjustments +
    addOnsTotal(pairing.items[0], parts[0].addOnIds) +
    addOnsTotal(pairing.items[1], parts[1].addOnIds)
  );
}

export function bundleRegularPrice(
  pairing: Pairing,
  parts: [OrderLinePart, OrderLinePart],
): number | null {
  if (pairing.pricing.regular === null) return null;
  const sizeAdjustments = parts.reduce((sum, part, index) => {
    const product = pairing.items[index];
    const selectedSize = product.sizes.find((size) => size.id === part.sizeId);
    const selectedRegular = selectedSize
      ? (selectedSize.pricing.regular ?? selectedSize.pricing.current)
      : (product.pricing.regular ?? product.pricing.current);
    const defaultRegular = product.pricing.regular ?? product.pricing.current;
    return sum + selectedRegular - defaultRegular;
  }, 0);
  return (
    pairing.pricing.regular +
    sizeAdjustments +
    addOnsTotal(pairing.items[0], parts[0].addOnIds) +
    addOnsTotal(pairing.items[1], parts[1].addOnIds)
  );
}

export function lineKey(
  kind: "item" | "bundle",
  refId: string,
  parts: OrderLinePart[],
): string {
  const partKey = (part: OrderLinePart) =>
    `${part.productId}:${part.sizeId ?? ""}:${[...part.addOnIds].sort().join(",")}`;
  return `${kind}:${refId}:${parts.map(partKey).join("|")}`;
}

export function makeLine(
  kind: "item",
  refId: string,
  parts: [OrderLinePart],
  qty: number,
): OrderLine;
export function makeLine(
  kind: "bundle",
  refId: string,
  parts: [OrderLinePart, OrderLinePart],
  qty: number,
): OrderLine;
export function makeLine(
  kind: "item" | "bundle",
  refId: string,
  parts: [OrderLinePart] | [OrderLinePart, OrderLinePart],
  qty: number,
): OrderLine {
  return {
    key: lineKey(kind, refId, parts),
    kind,
    refId,
    parts,
    qty,
  } as OrderLine;
}

export function lineUnitPrice(
  line: OrderLine,
  menu: MenuResponse,
): number | null {
  if (line.kind === "item") {
    const product = findProduct(menu, line.parts[0].productId);
    return product ? partUnitPrice(product, line.parts[0]) : null;
  }
  const pairing = findPairing(menu, line.refId);
  if (!pairing) return null;
  return bundleUnitPrice(pairing, [line.parts[0], line.parts[1]]);
}

export function lineRegularPrice(
  line: OrderLine,
  menu: MenuResponse,
): number | null {
  if (line.kind === "item") {
    const product = findProduct(menu, line.parts[0].productId);
    return product ? partRegularPrice(product, line.parts[0]) : null;
  }
  const pairing = findPairing(menu, line.refId);
  if (!pairing) return null;
  const regular = bundleRegularPrice(pairing, [line.parts[0], line.parts[1]]);
  return regular !== null &&
    regular > bundleUnitPrice(pairing, [line.parts[0], line.parts[1]])
    ? regular
    : null;
}

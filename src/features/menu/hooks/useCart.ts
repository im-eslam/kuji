import { useState } from "react";
import type { Locale } from "@/shared/i18n";
import type { AddOn, Pairing, Product, Size } from "../data/types";

// ==== Cart types ====

export interface Choice {
  product: Product;
  size: Size | null;
  addOns: AddOn[];
}

export interface CartLine {
  key: string;
  qty: number;
  pairing: Pairing | null;
  choices: Choice[];
}

export const MAX_QTY_IN_SHEET = 20;
export const MAX_QTY_IN_CART = 99;

// ==== Helpers ====

export function defaultChoice(product: Product): Choice {
  return { product, size: product.sizes[0] ?? null, addOns: [] };
}

export function makeLine(
  pairing: Pairing | null,
  choices: Choice[],
  qty: number,
): CartLine {
  const parts = choices.map(
    (c) =>
      `${c.product.id}:${c.size?.id ?? ""}:${c.addOns
        .map((a) => a.id)
        .sort()
        .join(",")}`,
  );
  return {
    key: `${pairing?.id ?? "single"}|${parts.join("|")}`,
    qty,
    pairing,
    choices,
  };
}

export function lineTitle(choices: Choice[], locale: Locale): string {
  return choices.map((c) => c.product.name[locale]).join(" + ");
}

export function priceOf(
  pairing: Pairing | null,
  choices: Choice[],
): { current: number; regular: number | null } {
  const addOnsTotal = choices.reduce(
    (sum, c) => sum + c.addOns.reduce((s, a) => s + a.price, 0),
    0,
  );

  let current: number;
  let regular: number | null;

  if (!pairing) {
    const pricing = (choices[0].size ?? choices[0].product).pricing;
    current = pricing.current;
    regular = pricing.regular;
  } else {
    current = pairing.pricing.current;
    regular = pairing.pricing.regular;
    for (const { product, size } of choices) {
      if (!size) continue;
      current += size.pricing.current - product.pricing.current;
      if (regular !== null) {
        regular +=
          (size.pricing.regular ?? size.pricing.current) -
          (product.pricing.regular ?? product.pricing.current);
      }
    }
  }

  current += addOnsTotal;
  if (regular !== null) regular += addOnsTotal;
  return {
    current,
    regular: regular !== null && regular > current ? regular : null,
  };
}

// ==== The cart ====

export function useCart() {
  const [lines, setLines] = useState<CartLine[]>([]);

  const count = lines.reduce((total, line) => total + line.qty, 0);
  const subtotal = lines.reduce(
    (total, line) =>
      total + priceOf(line.pairing, line.choices).current * line.qty,
    0,
  );

  function addOrMerge(current: CartLine[], line: CartLine): CartLine[] {
    if (!current.some((l) => l.key === line.key)) return [...current, line];
    return current.map((l) =>
      l.key === line.key ? { ...l, qty: l.qty + line.qty } : l,
    );
  }

  function add(line: CartLine) {
    setLines((current) => addOrMerge(current, line));
  }

  function replace(oldKey: string, line: CartLine) {
    setLines((current) =>
      line.key === oldKey
        ? current.map((l) => (l.key === oldKey ? line : l))
        : addOrMerge(
            current.filter((l) => l.key !== oldKey),
            line,
          ),
    );
  }

  function setQty(key: string, qty: number) {
    setLines((current) =>
      current.map((l) => (l.key === key ? { ...l, qty } : l)),
    );
  }

  function remove(key: string) {
    setLines((current) => current.filter((l) => l.key !== key));
  }

  function clear() {
    setLines([]);
  }

  return { lines, count, subtotal, add, replace, setQty, remove, clear };
}

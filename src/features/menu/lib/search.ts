import type { Category, MenuDb, Pairing, Product } from "../types";

export interface SearchResults {
  categories: Category[];
  pairings: Pairing[];
  items: Product[];
}

const EMPTY: SearchResults = { categories: [], pairings: [], items: [] };

export function searchMenu(db: MenuDb, query: string, pick: (text: Record<"en" | "ar", string>) => string): SearchResults {
  const q = query.trim().toLowerCase();
  if (!q) return EMPTY;

  const categories = db.categories.filter((c) => pick(c.name).toLowerCase().includes(q));
  const items = [...db.productsById.values()].filter(
    (p) => pick(p.name).toLowerCase().includes(q) || pick(p.desc).toLowerCase().includes(q),
  );
  const pairings = db.pairings.filter((pr) => pr.items.some((p) => pick(p.name).toLowerCase().includes(q)));

  return { categories, pairings, items };
}

import type { Category, MenuResponse, Pairing, Product } from "../types";

export interface SearchResults {
  categories: Category[];
  pairings: Pairing[];
  items: Product[];
}

const EMPTY: SearchResults = { categories: [], pairings: [], items: [] };

export function searchMenu(
  menu: MenuResponse,
  query: string,
  pick: (text: Record<"en" | "ar", string>) => string,
): SearchResults {
  const q = query.trim().toLocaleLowerCase();
  if (!q) return EMPTY;

  const categories = menu.categories.filter((category) =>
    pick(category.name).toLocaleLowerCase().includes(q),
  );
  const items = menu.categories
    .flatMap((category) => category.products)
    .filter(
      (product) =>
        pick(product.name).toLocaleLowerCase().includes(q) ||
        pick(product.description).toLocaleLowerCase().includes(q),
    );
  const pairings = menu.pairings.filter((pairing) =>
    pairing.items.some((product) =>
      pick(product.name).toLocaleLowerCase().includes(q),
    ),
  );

  return { categories, pairings, items };
}

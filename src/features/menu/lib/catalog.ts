import type { MenuResponse, Pairing, Product } from "../types";

export function findProduct(menu: MenuResponse, productId: string): Product | undefined {
  for (const category of menu.categories) {
    const product = category.products.find((item) => item.id === productId);
    if (product) return product;
  }
  return undefined;
}

export function findPairing(menu: MenuResponse, pairingId: string): Pairing | undefined {
  return menu.pairings.find((pairing) => pairing.id === pairingId);
}

export function allProducts(menu: MenuResponse): Product[] {
  return menu.categories.flatMap((category) => category.products);
}

export function isInStock(product: { availability: string }): boolean {
  return product.availability === "in_stock";
}

// Category photos: drop a file named after the category id (e.g. "c13.jpg") into src/assets/menu and it is
// picked up automatically, with no code change. A product with its own `image` wins over the category photo;
// a category with neither falls back to the placeholder the <Img> atom draws.
const categoryAssets = import.meta.glob("../../../assets/menu/*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const byId = new Map<string, string>(
  Object.entries(categoryAssets).map(([path, url]) => [path.replace(/^.*\/([^/]+)\.[^.]+$/, "$1"), url]),
);

export function resolveImage(productImage: string | null, categoryId: string): string | undefined {
  if (productImage) return productImage;
  return byId.get(categoryId);
}

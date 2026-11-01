import { useState, type CSSProperties } from "react";
import { Button } from "react-aria-components";
import { useLocale, useStrings } from "@/shared/i18n";
import { strings } from "../localization/strings";
import type { Category, Product } from "../data/types";
import { Badge, Chevron, Img, PriceWithDiscount, SecondaryButton, SectionHead } from "./ui";

/** How many products a category shows before the "Show all" button. */
const FIRST_VISIBLE = 4;

interface Props {
  category: Category;
  onOpen: (product: Product) => void;
}

/** One category: its title and its products. Long categories show the first few, then a "Show all" button. */
export function CategorySection({ category, onOpen }: Props) {
  const t = useStrings(strings);
  const locale = useLocale();
  const [showAll, setShowAll] = useState(false);
  const name = category.name[locale];
  const firstProducts = category.products.slice(0, FIRST_VISIBLE);
  const otherProducts = category.products.slice(FIRST_VISIBLE);

  return (
    <section id={category.id} className="flex scroll-mt-26 flex-col gap-4 py-6">
      <SectionHead title={name} />
      <div className="flex flex-col gap-3 px-4">
        {firstProducts.map((product) => (
          <ProductCard key={product.id} product={product} onOpen={onOpen} />
        ))}
        {showAll &&
          otherProducts.map((product, i) => (
            // --i delays each card a little more than the one before it (up to 6), so they appear one after another.
            <div key={product.id} style={{ "--i": Math.min(i, 6) } as CSSProperties} className="stagger animate-reveal-in">
              <ProductCard product={product} onOpen={onOpen} />
            </div>
          ))}
        {!showAll && otherProducts.length > 0 && (
          <SecondaryButton onPress={() => setShowAll(true)} className="w-full">
            {t.showAll(name, category.products.length)}
          </SecondaryButton>
        )}
      </div>
    </section>
  );
}

function ProductCard({ product, onOpen }: { product: Product; onOpen: (product: Product) => void }) {
  const locale = useLocale();
  const inStock = product.availability === "in_stock";
  const badge = inStock ? product.badge : "outOfStock";

  return (
    <Button
      onPress={() => onOpen(product)}
      className="group relative flex w-full gap-3 rounded-lg border border-arctic bg-white p-3 text-start transition-[transform,background-color] duration-150 ease-out data-pressed:scale-[0.98] data-pressed:bg-mist"
    >
      <Img image={product.image} className={`min-h-18 w-20 shrink-0 self-stretch rounded-md ${inStock ? "" : "grayscale"}`} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="line-clamp-2 text-balance text-body font-semibold">{product.name[locale]}</span>
        <span className="truncate text-caption font-medium text-navy/65">{product.description[locale]}</span>
        <span className="mt-auto flex items-center justify-between pt-1">
          <PriceWithDiscount value={product.pricing.current} regular={product.pricing.regular} />
          <span className="-my-1">
            <Chevron compact />
          </span>
        </span>
      </span>
      {badge && (
        <span className="absolute -top-2.5 end-4">
          <Badge kind={badge} compact />
        </span>
      )}
    </Button>
  );
}

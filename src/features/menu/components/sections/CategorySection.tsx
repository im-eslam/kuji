import { useState, type CSSProperties } from "react";
import { Button } from "react-aria-components";
import { useLocale, useStrings } from "@/shared/i18n";
import { strings } from "../../localization/strings";
import type { Category, Product } from "../../data/types";
import {
  Badge,
  cardSurface,
  Chevron,
  cx,
  Img,
  pagePadding,
  pageWidth,
  PriceWithDiscount,
  SecondaryButton,
  SectionHead,
} from "../shared/ui";

const FIRST_VISIBLE = 4;

interface Props {
  category: Category;
  onOpen: (product: Product) => void;
}

const styles = {
  section: "scroll-mt-26 py-6",
  inner: cx(pageWidth, pagePadding, "flex flex-col gap-4"),
  grid: "grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3",
  showAll: "w-full md:col-span-full md:mx-auto md:w-auto md:min-w-72",
};

export function CategorySection({ category, onOpen }: Props) {
  const t = useStrings(strings);
  const locale = useLocale();
  const [showAll, setShowAll] = useState(false);
  const name = category.name[locale];
  const firstProducts = category.products.slice(0, FIRST_VISIBLE);
  const otherProducts = category.products.slice(FIRST_VISIBLE);

  return (
    <section id={category.id} aria-label={name} className={styles.section}>
      <div className={styles.inner}>
        <SectionHead title={name} />
        <div className={styles.grid}>
          {firstProducts.map((product) => (
            <ProductCard key={product.id} product={product} onOpen={onOpen} />
          ))}
          {showAll &&
            otherProducts.map((product, i) => (
              <div
                key={product.id}
                style={{ "--i": Math.min(i, 6) } as CSSProperties}
                className="stagger animate-reveal-in"
              >
                <ProductCard product={product} onOpen={onOpen} />
              </div>
            ))}
          {!showAll && otherProducts.length > 0 && (
            <SecondaryButton
              onPress={() => setShowAll(true)}
              className={styles.showAll}
            >
              {t.showAll(name, category.products.length)}
            </SecondaryButton>
          )}
        </div>
      </div>
    </section>
  );
}

const cardStyles = {
  root: cx(cardSurface, "relative flex h-full w-full gap-3 p-3"),
  image: "size-24 shrink-0 rounded-md",
  content: "flex min-w-0 flex-1 flex-col gap-0.5",
  name: "line-clamp-2 text-body font-semibold text-balance",
  description: "line-clamp-1 text-caption font-medium text-navy/65",
  bottom: "mt-auto flex items-center justify-between gap-2 pt-1",
  unavailable: "opacity-60",
  chevron: "-my-1",
  badge: "absolute -top-2.5 end-4",
};

function ProductCard({
  product,
  onOpen,
}: {
  product: Product;
  onOpen: (product: Product) => void;
}) {
  const locale = useLocale();
  const inStock = product.availability === "in_stock";
  const badge = inStock ? product.badge : "outOfStock";
  const description = product.description[locale];

  return (
    <Button onPress={() => onOpen(product)} className={cardStyles.root}>
      <Img
        image={product.image}
        className={cx(cardStyles.image, !inStock && "grayscale")}
      />
      <span className={cardStyles.content}>
        <span className={cardStyles.name}>{product.name[locale]}</span>
        {description && (
          <span className={cardStyles.description}>{description}</span>
        )}
        <span className={cardStyles.bottom}>
          <span className={inStock ? undefined : cardStyles.unavailable}>
            <PriceWithDiscount
              value={product.pricing.current}
              regular={product.pricing.regular}
            />
          </span>
          <span className={cardStyles.chevron}>
            <Chevron compact />
          </span>
        </span>
      </span>
      {badge && (
        <span className={cardStyles.badge}>
          <Badge kind={badge} compact />
        </span>
      )}
    </Button>
  );
}

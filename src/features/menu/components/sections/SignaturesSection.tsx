import { useEffect, useRef, useState } from "react";
import { Button } from "react-aria-components";
import { useLocale, useStrings } from "@/shared/i18n";
import { strings } from "../../localization/strings";
import type { Product } from "../../data/types";
import {
  Badge,
  cardSurface,
  Chevron,
  cx,
  Img,
  pagePadding,
  pageWidth,
  PriceWithDiscount,
  SectionHead,
} from "../shared/ui";

interface Props {
  products: Product[];
  onOpen: (product: Product) => void;
}

const styles = {
  section: "scroll-mt-26 py-6",
  inner: cx(pageWidth, "flex flex-col gap-4"),
  head: pagePadding,
  rail: cx(
    "no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-4 scroll-ps-4 pb-1",
    "md:grid md:snap-none md:grid-cols-3 md:gap-4 md:overflow-visible md:px-6 lg:grid-cols-4",
  ),
  dots: "flex justify-center gap-2 md:hidden",
  dot: "size-2 rounded-full transition-colors duration-200 ease-out",
  dotActive: "bg-navy",
  dotIdle: "bg-arctic",
};

export function SignaturesSection({ products, onOpen }: Props) {
  const t = useStrings(strings);
  const rail = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const [index, setIndex] = useState(0);

  function onScroll() {
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const element = rail.current;
      const card = element?.querySelector<HTMLElement>("[data-carousel-card]");
      if (!element || !card) return;
      const gap = parseFloat(getComputedStyle(element).columnGap) || 16;
      const step = card.offsetWidth + gap;
      setIndex(
        Math.min(
          products.length - 1,
          Math.max(0, Math.round(Math.abs(element.scrollLeft) / step)),
        ),
      );
    });
  }
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return (
    <section
      id="signatures"
      aria-label={t.signaturesTitle}
      className={styles.section}
    >
      <div className={styles.inner}>
        <div className={styles.head}>
          <SectionHead title={t.signaturesTitle} sub={t.signaturesSub} />
        </div>
        <div ref={rail} onScroll={onScroll} className={styles.rail}>
          {products.map((product, i) => (
            <SignatureCard
              key={product.id}
              product={product}
              onOpen={onOpen}
              priority={i === 0}
            />
          ))}
        </div>
        <div className={styles.dots} aria-hidden="true">
          {products.map((product, i) => (
            <span
              key={product.id}
              className={cx(
                styles.dot,
                i === index ? styles.dotActive : styles.dotIdle,
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

const cardStyles = {
  root: cx(
    cardSurface,
    "flex w-[72%] min-w-64 max-w-96 shrink-0 snap-start flex-col gap-3 p-3 xs:p-4",
    "md:w-auto md:min-w-0 md:max-w-none",
  ),
  frame: "relative block",
  image: "aspect-square w-full rounded-md",
  badge: "absolute end-2 top-2",
  text: "flex min-w-0 flex-col gap-1",
  name: "line-clamp-2 text-heading font-bold text-balance",
  description: "line-clamp-2 text-caption font-medium text-pretty text-navy/65",
  bottom: "mt-auto flex items-center justify-between gap-2 pt-1",
  unavailable: "opacity-60",
};

function SignatureCard({
  product,
  onOpen,
  priority,
}: {
  product: Product;
  onOpen: (product: Product) => void;
  priority: boolean;
}) {
  const locale = useLocale();
  const inStock = product.availability === "in_stock";
  const badge = inStock ? product.badge : "outOfStock";
  const description = product.description[locale];

  return (
    <Button
      data-carousel-card
      onPress={() => onOpen(product)}
      className={cardStyles.root}
    >
      <span className={cardStyles.frame}>
        <Img
          image={product.image}
          priority={priority}
          className={cx(cardStyles.image, !inStock && "grayscale")}
        />
        {badge && (
          <span className={cardStyles.badge}>
            <Badge kind={badge} />
          </span>
        )}
      </span>
      <span className={cardStyles.text}>
        <span className={cardStyles.name}>{product.name[locale]}</span>
        {description && (
          <span className={cardStyles.description}>{description}</span>
        )}
      </span>
      <span
        className={cx(cardStyles.bottom, !inStock && cardStyles.unavailable)}
      >
        <PriceWithDiscount
          value={product.pricing.current}
          regular={product.pricing.regular}
          size="body"
        />
        <Chevron />
      </span>
    </Button>
  );
}

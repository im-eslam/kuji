import { useEffect, useRef, useState } from "react";
import { Button } from "react-aria-components";
import { useLocale, useStrings } from "@/shared/i18n";
import { strings } from "../localization/strings";
import type { Product } from "../data/types";
import { Badge, Chevron, Img, PriceWithDiscount, SectionHead } from "./ui";

interface Props {
  products: Product[];
  onOpen: (product: Product) => void;
}

/** "Our signatures": a row of big cards you swipe through, with dots showing where you are. */
export function SignaturesSection({ products, onOpen }: Props) {
  const t = useStrings(strings);
  const rail = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const [index, setIndex] = useState(0);

  // The dots follow the scroll position: how far the row has scrolled, divided by one card plus the gap.
  // At most once per animation frame, so scrolling stays smooth.
  function onScroll() {
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const element = rail.current;
      const card = element?.querySelector<HTMLElement>("[data-carousel-card]");
      if (!element || !card) return;
      const gap = parseFloat(getComputedStyle(element).columnGap) || 16;
      const step = card.offsetWidth + gap;
      setIndex(Math.min(products.length - 1, Math.max(0, Math.round(Math.abs(element.scrollLeft) / step))));
    });
  }
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return (
    <section id="signatures" className="flex scroll-mt-26 flex-col gap-4 py-6">
      <SectionHead title={t.signaturesTitle} sub={t.signaturesSub} />
      <div ref={rail} onScroll={onScroll} className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-4 scroll-ps-4">
        {products.map((product, i) => (
          <SignatureCard key={product.id} product={product} onOpen={onOpen} priority={i === 0} />
        ))}
      </div>
      <div className="flex justify-center gap-2" aria-hidden="true">
        {products.map((product, i) => (
          <span key={product.id} className={`size-2 rounded-full transition-colors duration-200 ease-out ${i === index ? "bg-navy" : "bg-arctic"}`} />
        ))}
      </div>
    </section>
  );
}

function SignatureCard({ product, onOpen, priority }: { product: Product; onOpen: (product: Product) => void; priority: boolean }) {
  const locale = useLocale();
  const inStock = product.availability === "in_stock";
  const badge = inStock ? product.badge : "outOfStock";

  return (
    <Button
      data-carousel-card
      onPress={() => onOpen(product)}
      className="group flex w-[72%] min-w-64 max-w-96 shrink-0 snap-start flex-col gap-3 rounded-lg border border-arctic bg-white p-3 text-start transition-[transform,background-color] duration-150 ease-out data-pressed:scale-[0.98] data-pressed:bg-mist xs:p-4"
    >
      <span className="relative block">
        <Img image={product.image} priority={priority} className={`aspect-square w-full rounded-md ${inStock ? "" : "grayscale"}`} />
        {badge && (
          <span className="absolute end-2 top-2">
            <Badge kind={badge} />
          </span>
        )}
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="line-clamp-2 text-balance text-heading font-bold">{product.name[locale]}</span>
        <span className="line-clamp-2 text-pretty text-caption font-medium text-navy/65">{product.description[locale]}</span>
      </span>
      <span className={`mt-auto flex items-center justify-between ${inStock ? "" : "opacity-60"}`}>
        <PriceWithDiscount value={product.pricing.current} regular={product.pricing.regular} size="body" />
        <Chevron />
      </span>
    </Button>
  );
}

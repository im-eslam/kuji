import { memo } from "react";
import { Button } from "react-aria-components";
import { basePriceFor, defaultSizeId, discountedBasePrice } from "../../lib/pricing";
import type { Product } from "../../types";
import { Badge } from "../atoms/Badge";
import { Chevron } from "../atoms/Chevron";
import { Img } from "../atoms/Image";
import { Price } from "../atoms/Price";

interface Props {
  item: Product;
  name: string;
  desc: string;
  onPress: (id: string) => void;
  priority?: boolean;
}

// Width is a share of the rail, so the next card always peeks. Cards in the rail are as tall as the tallest,
// and the price row is pinned to the bottom edge of every one.
export const SignatureCard = memo(function SignatureCard({ item, name, desc, onPress, priority }: Props) {
  const price = discountedBasePrice(item, basePriceFor(item, defaultSizeId(item)));
  return (
    <Button
      data-carousel-card
      onPress={() => onPress(item.id)}
      className="group flex w-[72%] min-w-64 max-w-96 shrink-0 snap-start flex-col gap-3 rounded-lg border border-arctic bg-white p-3 text-start transition-[transform,background-color] duration-150 ease-out data-pressed:scale-[0.98] data-pressed:bg-mist xs:p-4"
    >
      <span className="relative block">
        <Img productImage={item.image} categoryId={item.categoryId} priority={priority} className="aspect-square w-full rounded-md" />
        {item.badge && (
          <span className="absolute end-2 top-2">
            <Badge kind={item.badge} />
          </span>
        )}
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="line-clamp-2 text-balance text-heading font-bold">{name}</span>
        <span className="line-clamp-2 text-pretty text-caption font-medium text-navy/65">{desc}</span>
      </span>
      <span className="mt-auto flex items-center justify-between">
        <Price value={price} size="body" />
        <Chevron />
      </span>
    </Button>
  );
});

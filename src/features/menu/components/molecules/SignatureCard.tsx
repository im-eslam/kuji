import { memo } from "react";
import { Button } from "react-aria-components";
import type { Product } from "../../types";
import { isInStock } from "../../lib/catalog";
import { Badge } from "../atoms/Badge";
import { Chevron } from "../atoms/Chevron";
import { Img } from "../atoms/Image";
import { PriceWithDiscount } from "../atoms/PriceWithDiscount";

interface Props {
  item: Product;
  name: string;
  desc: string;
  onPress: (id: string) => void;
  priority?: boolean;
}

export const SignatureCard = memo(function SignatureCard({ item, name, desc, onPress, priority }: Props) {
  const inStock = isInStock(item);
  return (
    <Button
      data-carousel-card
      onPress={() => onPress(item.id)}
      className="group flex w-[72%] min-w-64 max-w-96 shrink-0 snap-start flex-col gap-3 rounded-lg border border-arctic bg-white p-3 text-start transition-[transform,background-color] duration-150 ease-out data-pressed:scale-[0.98] data-pressed:bg-mist xs:p-4"
    >
      <span className="relative block">
        <Img image={item.image} priority={priority} className={`aspect-square w-full rounded-md ${inStock ? "" : "grayscale"}`} />
        {(item.badge || !inStock) && <span className="absolute end-2 top-2"><Badge kind={inStock ? item.badge! : "outOfStock"} /></span>}
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="line-clamp-2 text-balance text-heading font-bold">{name}</span>
        <span className="line-clamp-2 text-pretty text-caption font-medium text-navy/65">{desc}</span>
      </span>
      <span className={`mt-auto flex items-center justify-between ${inStock ? "" : "opacity-60"}`}>
        <PriceWithDiscount value={item.pricing.current} regular={item.pricing.regular} size="body" />
        <Chevron />
      </span>
    </Button>
  );
});

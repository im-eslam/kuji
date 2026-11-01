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
}

// Compact by construction: a card is as short as its text allows. Title up to 2 lines, description always 1 line.
export const ListCard = memo(function ListCard({ item, name, desc, onPress }: Props) {
  const base = basePriceFor(item, defaultSizeId(item));
  const price = discountedBasePrice(item, base);
  return (
    <Button
      onPress={() => onPress(item.id)}
      className="group relative flex w-full gap-3 rounded-lg border border-arctic bg-white p-3 text-start transition-[transform,background-color] duration-150 ease-out data-pressed:scale-[0.98] data-pressed:bg-mist"
    >
      <Img productImage={item.image} categoryId={item.categoryId} className="min-h-18 w-20 shrink-0 self-stretch rounded-md" />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="line-clamp-2 text-balance text-body font-semibold">{name}</span>
        <span className="truncate text-caption font-medium text-navy/65">{desc}</span>
        <span className="mt-auto flex items-center justify-between pt-1">
          <span className="flex items-baseline gap-1.5">
            <Price value={price} size="small" />
            {price < base && <Price value={base} size="caption" struck />}
          </span>
          <span className="-my-1">
            <Chevron compact />
          </span>
        </span>
      </span>
      {item.badge && (
        <span className="absolute -top-2.5 end-4">
          <Badge kind={item.badge} compact />
        </span>
      )}
    </Button>
  );
});

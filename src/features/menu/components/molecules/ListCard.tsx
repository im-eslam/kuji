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
}

export const ListCard = memo(function ListCard({ item, name, desc, onPress }: Props) {
  const inStock = isInStock(item);
  return (
    <Button
      onPress={() => onPress(item.id)}
      className="group relative flex w-full gap-3 rounded-lg border border-arctic bg-white p-3 text-start transition-[transform,background-color] duration-150 ease-out data-pressed:scale-[0.98] data-pressed:bg-mist"
    >
      <Img image={item.image} className={`min-h-18 w-20 shrink-0 self-stretch rounded-md ${inStock ? "" : "grayscale"}`} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="line-clamp-2 text-balance text-body font-semibold">{name}</span>
        <span className="truncate text-caption font-medium text-navy/65">{desc}</span>
        <span className="mt-auto flex items-center justify-between pt-1">
          <PriceWithDiscount value={item.pricing.current} regular={item.pricing.regular} />
          <span className="-my-1"><Chevron compact /></span>
        </span>
      </span>
      {(item.badge || !inStock) && (
        <span className="absolute -top-2.5 end-4"><Badge kind={inStock ? item.badge! : "outOfStock"} compact /></span>
      )}
    </Button>
  );
});

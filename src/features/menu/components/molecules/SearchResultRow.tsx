import { Button } from "react-aria-components";
import { basePriceFor, defaultSizeId, discountedBasePrice } from "../../lib/pricing";
import type { Product } from "../../types";
import { Hairline } from "../atoms/Hairline";
import { Img } from "../atoms/Image";
import { Badge } from "../atoms/Badge";
import { PriceWithDiscount } from "../atoms/PriceWithDiscount";

interface Props {
  item: Product;
  name: string;
  desc: string;
  onPress: (id: string) => void;
}

export function SearchResultRow({ item, name, desc, onPress }: Props) {
  const price = discountedBasePrice(item, basePriceFor(item, defaultSizeId(item)));
  return (
    <div>
      <Button onPress={() => onPress(item.id)} className="flex min-h-18 w-full items-center gap-3 px-4 py-2 text-start data-pressed:bg-mist">
        <Img productImage={item.image} categoryId={item.categoryId} className={`size-12 shrink-0 rounded-md ${item.inStock ? "" : "grayscale"}`} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-body font-medium">{name}</span>
          <span className="line-clamp-1 text-caption font-medium text-navy/65">{desc}</span>
          {!item.inStock && <Badge kind="outOfStock" compact />}
        </span>
        <span className={item.inStock ? "" : "opacity-60"}>
          <PriceWithDiscount value={price} regular={price < basePriceFor(item, defaultSizeId(item)) ? basePriceFor(item, defaultSizeId(item)) : null} />
        </span>
      </Button>
      <Hairline />
    </div>
  );
}

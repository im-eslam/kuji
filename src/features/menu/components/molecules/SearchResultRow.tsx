import { Button } from "react-aria-components";
import type { Product } from "../../types";
import { isInStock } from "../../lib/catalog";
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
  const inStock = isInStock(item);
  return (
    <div>
      <Button onPress={() => onPress(item.id)} className="flex min-h-18 w-full items-center gap-3 px-4 py-2 text-start data-pressed:bg-mist">
        <Img image={item.image} className={`size-12 shrink-0 rounded-md ${inStock ? "" : "grayscale"}`} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-body font-medium">{name}</span>
          <span className="line-clamp-1 text-caption font-medium text-navy/65">{desc}</span>
          {!inStock && <Badge kind="outOfStock" compact />}
        </span>
        <span className={inStock ? "" : "opacity-60"}>
          <PriceWithDiscount value={item.pricing.current} regular={item.pricing.regular} />
        </span>
      </Button>
      <Hairline />
    </div>
  );
}

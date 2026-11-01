import { useStrings } from "@/shared/i18n";
import { strings } from "../../strings";
import { basePriceFor, defaultSizeId, discountedBasePrice } from "../../lib/pricing";
import type { Product } from "../../types";
import { Badge } from "../atoms/Badge";
import { Img } from "../atoms/Image";
import { PlusButton } from "../atoms/PlusButton";
import { PriceWithDiscount } from "../atoms/PriceWithDiscount";
import { Rolling } from "../atoms/Rolling";

interface Props {
  item: Product;
  name: string;
  addedCount: number;
  done: boolean;
  onQuickAdd: (item: Product) => void;
}

export function OftenOrderedCard({ item, name, addedCount, done, onQuickAdd }: Props) {
  const t = useStrings(strings);
  const price = discountedBasePrice(item, basePriceFor(item, defaultSizeId(item)));
  return (
    <div className="flex w-26 shrink-0 flex-col gap-1 rounded-md border border-arctic bg-white p-2">
      <div className="relative">
        <Img productImage={item.image} categoryId={item.categoryId} className={`h-16 w-full rounded-md ${item.inStock ? "" : "grayscale"}`} />
        {!item.inStock && (
          <span className="absolute end-1 top-1">
            <Badge kind="outOfStock" compact />
          </span>
        )}
        {addedCount > 0 && (
          <span className="absolute bottom-1 start-1">
            <Badge kind="count" compact>
              <Rolling text={t.quickAdded(addedCount)} />
            </Badge>
          </span>
        )}
      </div>
      <span className={`line-clamp-2 min-h-[2lh] text-caption font-medium ${item.inStock ? "" : "text-navy/60"}`}>{name}</span>
      <div className="flex items-center justify-between">
        <span className={item.inStock ? "" : "opacity-60"}>
          <PriceWithDiscount value={price} regular={price < basePriceFor(item, defaultSizeId(item)) ? basePriceFor(item, defaultSizeId(item)) : null} size="caption" />
        </span>
        {item.inStock && <PlusButton small done={done} label={t.a11yQuickAdd(name)} onPress={() => onQuickAdd(item)} />}
      </div>
    </div>
  );
}

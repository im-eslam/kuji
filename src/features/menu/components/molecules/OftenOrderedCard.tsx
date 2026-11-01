import { useStrings } from "@/shared/i18n";
import { strings } from "../../strings";
import type { ProductPreview } from "../../types";
import { isInStock } from "../../lib/catalog";
import { Badge } from "../atoms/Badge";
import { Img } from "../atoms/Image";
import { PlusButton } from "../atoms/PlusButton";
import { PriceWithDiscount } from "../atoms/PriceWithDiscount";
import { Rolling } from "../atoms/Rolling";

interface Props {
  item: ProductPreview;
  name: string;
  addedCount: number;
  done: boolean;
  onQuickAdd: (item: ProductPreview) => void;
}

export function OftenOrderedCard({ item, name, addedCount, done, onQuickAdd }: Props) {
  const t = useStrings(strings);
  const inStock = isInStock(item);
  return (
    <div className="flex w-26 shrink-0 flex-col gap-1 rounded-md border border-arctic bg-white p-2">
      <div className="relative">
        <Img image={item.image} className={`h-16 w-full rounded-md ${inStock ? "" : "grayscale"}`} />
        {!inStock && <span className="absolute end-1 top-1"><Badge kind="outOfStock" compact /></span>}
        {addedCount > 0 && <span className="absolute bottom-1 start-1"><Badge kind="count" compact><Rolling text={t.quickAdded(addedCount)} /></Badge></span>}
      </div>
      <span className={`line-clamp-2 min-h-[2lh] text-caption font-medium ${inStock ? "" : "text-navy/60"}`}>{name}</span>
      <div className="flex items-center justify-between">
        <span className={inStock ? "" : "opacity-60"}>
          <PriceWithDiscount value={item.pricing.current} regular={item.pricing.regular} size="caption" />
        </span>
        {inStock && <PlusButton small done={done} label={t.a11yQuickAdd(name)} onPress={() => onQuickAdd(item)} />}
      </div>
    </div>
  );
}

import { lineRegularPrice, lineUnitPrice } from "../../lib/pricing";
import type { MenuDb, OrderLine as Line } from "../../types";
import { Chip } from "../atoms/Chip";
import { Img } from "../atoms/Image";
import { OrderLineFrame } from "./OrderLine";

interface Props {
  line: Line;
  db: MenuDb;
  pick: (name: { en: string; ar: string }) => string;
  onEdit: (line: Line) => void;
  onSetQty: (line: Line, qty: number) => void;
  onRemove: (line: Line) => void;
}

export function OrderLineItem({ line, db, pick, ...handlers }: Props) {
  const part = line.parts[0];
  const product = db.productsById.get(part.productId);
  if (!product) return null;
  const size = part.sizeId ? db.sizesById.get(part.sizeId) : undefined;
  const chips = [...(size ? [pick(size.name)] : []), ...part.addOnIds.flatMap((id) => { const a = db.addOnsById.get(id); return a ? [pick(a.name)] : []; })];
  return (
    <OrderLineFrame
      line={line}
      title={pick(product.name)}
      thumb={<Img productImage={product.image} categoryId={product.categoryId} className="size-16 shrink-0 rounded-md" />}
      details={chips.length > 0 ? <span className="flex flex-wrap gap-1">{chips.map((c, i) => <Chip key={i} compact>{c}</Chip>)}</span> : null}
      unit={lineUnitPrice(line, db.productsById, db.pairingsById, db.addOnsById)}
      regular={lineRegularPrice(line, db.productsById, db.pairingsById, db.addOnsById)}
      {...handlers}
    />
  );
}

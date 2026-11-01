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

export function OrderLineBundle({ line, db, pick, ...handlers }: Props) {
  const products = line.parts.map((p) => db.productsById.get(p.productId));
  if (products.some((p) => !p)) return null;
  const items = products as NonNullable<(typeof products)[number]>[];
  const names = items.map((i) => pick(i.name));
  const rows = line.parts.flatMap((p, i) => {
    const size = p.sizeId ? db.sizesById.get(p.sizeId) : undefined;
    const chips = [...(size ? [pick(size.name)] : []), ...p.addOnIds.flatMap((id) => { const a = db.addOnsById.get(id); return a ? [pick(a.name)] : []; })];
    return chips.length > 0 ? [{ name: names[i], chips }] : [];
  });
  return (
    <OrderLineFrame
      line={line}
      title={names.join(" + ")}
      thumb={
        <span className="flex size-16 shrink-0 gap-1">
          <Img productImage={items[0].image} categoryId={items[0].categoryId} className="h-full flex-1 rounded-md" />
          <Img productImage={items[1].image} categoryId={items[1].categoryId} className="h-full flex-1 rounded-md" />
        </span>
      }
      details={
        rows.length > 0 ? (
          <span className="flex flex-col gap-1">
            {rows.map((r, i) => (
              <span key={i} className="flex flex-wrap items-center gap-1">
                <span className="text-caption font-medium text-navy/65">{r.name}</span>
                {r.chips.map((c, j) => (
                  <Chip key={j} compact>
                    {c}
                  </Chip>
                ))}
              </span>
            ))}
          </span>
        ) : null
      }
      unit={lineUnitPrice(line, db.productsById, db.pairingsById, db.addOnsById)}
      regular={lineRegularPrice(line, db.productsById, db.pairingsById, db.addOnsById)}
      {...handlers}
    />
  );
}

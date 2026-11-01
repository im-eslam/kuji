import { findProduct } from "../../lib/catalog";
import { lineRegularPrice, lineUnitPrice } from "../../lib/pricing";
import type { MenuResponse, OrderLine } from "../../types";
type Line = Extract<OrderLine, { kind: "item" }>;
import { Chip } from "../atoms/Chip";
import { Img } from "../atoms/Image";
import { OrderLineFrame } from "./OrderLine";

interface Props {
  line: Line;
  menu: MenuResponse;
  pick: (name: { en: string; ar: string }) => string;
  onEdit: (line: Line) => void;
  onSetQty: (line: Line, qty: number) => void;
  onRemove: (line: Line) => void;
}

export function OrderLineItem({ line, menu, pick, ...handlers }: Props) {
  const part = line.parts[0];
  const product = findProduct(menu, part.productId);
  if (!product) return null;

  const size = product.sizes.find((item) => item.id === part.sizeId);
  const chips = [
    ...(size ? [pick(size.name)] : []),
    ...part.addOnIds.flatMap((id) => {
      const addOn = product.addOns.find((item) => item.id === id);
      return addOn ? [pick(addOn.name)] : [];
    }),
  ];

  return (
    <OrderLineFrame
      line={line}
      title={pick(product.name)}
      thumb={<Img image={product.image} className="size-16 shrink-0 rounded-md" />}
      details={chips.length > 0 ? <span className="flex flex-wrap gap-1">{chips.map((chip, index) => <Chip key={index} compact>{chip}</Chip>)}</span> : null}
      unit={lineUnitPrice(line, menu)}
      regular={lineRegularPrice(line, menu)}
      onEdit={(value) => handlers.onEdit(value as Line)}
      onSetQty={(value, qty) => handlers.onSetQty(value as Line, qty)}
      onRemove={(value) => handlers.onRemove(value as Line)}
    />
  );
}

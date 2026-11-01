import { findProduct } from "../../lib/catalog";
import { lineRegularPrice, lineUnitPrice } from "../../lib/pricing";
import type { MenuResponse, OrderLine } from "../../types";
type Line = Extract<OrderLine, { kind: "bundle" }>;
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

export function OrderLineBundle({ line, menu, pick, ...handlers }: Props) {
  const products = line.parts.map((part) => findProduct(menu, part.productId));
  if (products.length !== 2 || products.some((product) => !product)) return null;
  const [first, second] = products as [NonNullable<typeof products[0]>, NonNullable<typeof products[1]>];
  const names = [pick(first.name), pick(second.name)];
  const rows = line.parts.flatMap((part, index) => {
    const product = index === 0 ? first : second;
    const size = product.sizes.find((item) => item.id === part.sizeId);
    const chips = [
      ...(size ? [pick(size.name)] : []),
      ...part.addOnIds.flatMap((id) => {
        const addOn = product.addOns.find((item) => item.id === id);
        return addOn ? [pick(addOn.name)] : [];
      }),
    ];
    return chips.length > 0 ? [{ name: names[index], chips }] : [];
  });

  return (
    <OrderLineFrame
      line={line}
      title={names.join(" + ")}
      thumb={
        <span className="flex size-16 shrink-0 gap-1">
          <Img image={first.image} className="h-full flex-1 rounded-md" />
          <Img image={second.image} className="h-full flex-1 rounded-md" />
        </span>
      }
      details={rows.length > 0 ? (
        <span className="flex flex-col gap-1">
          {rows.map((row, index) => (
            <span key={index} className="flex flex-wrap items-center gap-1">
              <span className="text-caption font-medium text-navy/65">{row.name}</span>
              {row.chips.map((chip, chipIndex) => <Chip key={chipIndex} compact>{chip}</Chip>)}
            </span>
          ))}
        </span>
      ) : null}
      unit={lineUnitPrice(line, menu)}
      regular={lineRegularPrice(line, menu)}
      onEdit={(value) => handlers.onEdit(value as Line)}
      onSetQty={(value, qty) => handlers.onSetQty(value as Line, qty)}
      onRemove={(value) => handlers.onRemove(value as Line)}
    />
  );
}

import type { ItemOptionsState } from "../../hooks/useItemOptions";
import { useMoney } from "../../lib/money";
import type { Product } from "../../types";
import { Img } from "../atoms/Image";
import { AddOnList } from "./AddOnList";
import { BaristaWayToggle } from "./BaristaWayToggle";
import { SizePicker } from "./SizePicker";

interface Props {
  item: Product;
  name: string;
  opts: ItemOptionsState;
  pick: (name: Product["name"]) => string;
  withProductRow?: boolean;
}

/** Displays the size/add-on choices that the backend included for this product. */
export function OptionBlock({ item, name, opts, pick, withProductRow }: Props) {
  const money = useMoney();
  if (!opts.showBarista && !opts.showSize && !opts.showAddOns) return null;

  return (
    <section aria-label={name} className="flex flex-col gap-4">
      {withProductRow && (
        <div className="flex items-center gap-3 px-4">
          <Img image={item.image} className="size-12 shrink-0 rounded-md" />
          <h3 className="text-body font-semibold">{name}</h3>
        </div>
      )}
      {opts.showSize && (
        <SizePicker
          sizes={item.sizes.map((size) => ({
            id: size.id,
            name: pick(size.name),
            priceLabel: money(size.pricing.current),
            regularLabel: size.pricing.regular !== null ? money(size.pricing.regular) : undefined,
          }))}
          value={opts.sizeId}
          onChange={opts.setSizeId}
        />
      )}
      {opts.showBarista && <div className="px-4"><BaristaWayToggle isOn={opts.baristaOn} onChange={opts.toggleBarista} /></div>}
      {opts.showAddOns && <AddOnList addOns={opts.addOns} selected={opts.addOnIds} onChange={(ids) => setAddOns(opts, ids)} pick={pick} />}
    </section>
  );
}

function setAddOns(opts: ItemOptionsState, ids: string[]) {
  const added = ids.filter((id) => !opts.addOnIds.includes(id));
  const removed = opts.addOnIds.filter((id) => !ids.includes(id));
  [...added, ...removed].forEach((id) => opts.toggleAddOn(id));
}

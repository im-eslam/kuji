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

// Only the blocks this product's profile allows, in the order people decide: size, then Barista's Way, then add-ons.
export function OptionBlock({ item, name, opts, pick, withProductRow }: Props) {
  const money = useMoney();
  if (!opts.showBarista && !opts.showSize && !opts.showAddOns) return null;
  const baristaNames = item.baristaWay?.addOnIds
    .map((id) => opts.addOns.find((a) => a.id === id))
    .filter((a): a is NonNullable<typeof a> => !!a)
    .map((a) => pick(a.name))
    .join(" + ");
  const baristaPrice = item.baristaWay?.addOnIds.reduce((sum, id) => sum + (opts.addOns.find((a) => a.id === id)?.price ?? 0), 0) ?? 0;

  return (
    <section aria-label={name} className="flex flex-col gap-4">
      {withProductRow && (
        <div className="flex items-center gap-3 px-4">
          <Img productImage={item.image} categoryId={item.categoryId} className="size-12 shrink-0 rounded-md" />
          <h3 className="text-body font-semibold">{name}</h3>
        </div>
      )}
      {opts.showSize && (
        <SizePicker
          sizes={item.sizes.map((s) => ({ id: s.id, label: money(s.price) }))}
          value={opts.sizeId}
          onChange={opts.setSizeId}
        />
      )}
      {opts.showBarista && (
        <div className="px-4">
          <BaristaWayToggle isOn={opts.baristaOn} onChange={opts.toggleBarista} names={baristaNames ?? ""} price={baristaPrice} />
        </div>
      )}
      {opts.showAddOns && <AddOnList addOns={opts.addOns} selected={opts.addOnIds} onChange={(ids) => setAddOns(opts, ids)} pick={pick} />}
    </section>
  );
}

function setAddOns(opts: ItemOptionsState, ids: string[]) {
  // CheckboxGroup reports the full next selection; reconcile it against the current state one toggle at a time
  // so the existing per-id toggleAddOn (which also turns off the Barista's Way match) stays the single source of truth.
  const added = ids.filter((id) => !opts.addOnIds.includes(id));
  const removed = opts.addOnIds.filter((id) => !ids.includes(id));
  [...added, ...removed].forEach((id) => opts.toggleAddOn(id));
}

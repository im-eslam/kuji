import { useLayoutEffect, useState } from "react";
import { useLocale, useStrings } from "@/shared/i18n";
import { LIMITS, QUICK_ADD_FLASH_MS } from "../../config";
import { partFromOptions, useItemOptions } from "../../hooks/useItemOptions";
import { useMenuState } from "../../hooks/useMenuState";
import { makeLine, partUnitPrice } from "../../lib/pricing";
import { strings } from "../../strings";
import type { Product } from "../../types";
import { Badge } from "../atoms/Badge";
import { Img } from "../atoms/Image";
import { AddToOrderBar } from "../molecules/AddToOrderBar";
import { OftenOrderedCard } from "../molecules/OftenOrderedCard";
import { OptionBlock } from "../molecules/OptionBlock";
import { SheetTitle } from "../molecules/SheetTitle";
import { BottomSheet } from "./BottomSheet";

interface Props {
  isOpen: boolean;
  itemId: string;
  editKey?: string;
}

function pickFor(locale: "en" | "ar") {
  return (text: { en: string; ar: string }) => text[locale];
}

export function ItemSheet({ isOpen, itemId, editKey }: Props) {
  const locale = useLocale();
  const pick = pickFor(locale);
  const t = useStrings(strings);
  const { db, lines, add, updateLine, announce, swapToOrder, close } = useMenuState();
  const item = db.productsById.get(itemId) as Product | undefined;
  const editing = editKey ? lines.find((l) => l.key === editKey) : undefined;
  const initial = editing?.parts[0];
  const addOnsForProduct = item ? (db.addOnsByProduct.get(item.id) ?? []) : [];
  const opts = useItemOptions(
    item ?? ({} as Product),
    addOnsForProduct,
    initial && { sizeId: initial.sizeId, addOnIds: initial.addOnIds },
    isOpen ? `${itemId}:${editKey ?? "new"}` : undefined,
  );
  const [qty, setQty] = useState(editing?.qty ?? 1);
  const [added, setAdded] = useState<Record<string, number>>({});
  const [flash, setFlash] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (!isOpen) return;
    setQty(editing?.qty ?? 1);
    setAdded({});
    setFlash(null);
  }, [isOpen, itemId, editKey]);

  if (!item) return null;

  const part = partFromOptions(item, opts);
  const unit = partUnitPrice(item, part, db.addOnsById);
  const total = unit * qty;
  const name = pick(item.name);

  const submit = () => {
    if (!item.inStock) return;
    const line = makeLine("item", item.id, [part], qty);
    if (editing) {
      updateLine(editing.key, { ...line, qty });
      announce(t.a11yOrderUpdated);
      swapToOrder(line.key);
    } else {
      add(line);
      announce(t.a11yAdded(name));
      close();
    }
  };

  const quickAdd = (other: Product) => {
    if (!other.inStock) return;
    add(makeLine("item", other.id, [{ productId: other.id, sizeId: undefined, addOnIds: [] }], 1));
    setAdded((a) => ({ ...a, [other.id]: (a[other.id] ?? 0) + 1 }));
    setFlash(other.id);
    window.setTimeout(() => setFlash((f) => (f === other.id ? null : f)), QUICK_ADD_FLASH_MS);
    announce(t.a11yAdded(pick(other.name)));
  };

  const label = editing ? t.updateOrder : t.addToOrder;
  const oftenOrdered = item.oftenOrderedWith.flatMap((id) => {
    const p = db.productsById.get(id);
    return p ? [p] : [];
  });

  return (
    <BottomSheet
      isOpen={isOpen}
      label={name}
      onClose={editing ? () => swapToOrder(editing.key) : close}
      footer={item.inStock ? (
        <AddToOrderBar
          title={name}
          qty={qty}
          max={editing ? LIMITS.lineQty : LIMITS.sheetQty}
          onQty={setQty}
          label={label}
          total={total}
          onSubmit={submit}
        />
      ) : undefined}
    >
      <div className="flex flex-col gap-6">
        <div className="px-4">
          <div className="relative">
            <Img
              productImage={item.image}
              categoryId={item.categoryId}
              alt={name}
              className={`aspect-4/3 w-full rounded-lg ${item.inStock ? "" : "grayscale"}`}
            />
            {!item.inStock && (
              <span className="absolute end-2 top-2">
                <Badge kind="outOfStock" />
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 px-4">
          {item.inStock && item.badge && (
            <div>
              <Badge kind={item.badge} />
            </div>
          )}
          <SheetTitle>{name}</SheetTitle>
          <p className="text-small font-medium text-navy/65">{pick(item.desc)}</p>
        </div>
        <OptionBlock
          item={item}
          name={name}
          opts={opts}
          pick={pick}
          pickSize={(id) => pick(db.sizesById.get(id)?.name ?? { en: id, ar: id })}
          discountedSizes
        />
        {!editing && oftenOrdered.length > 0 && (
          <section aria-label={t.oftenOrdered} className="flex flex-col gap-2">
            <h3 className="px-4 text-body font-bold">{t.oftenOrdered}</h3>
            <div className="no-scrollbar flex gap-2 overflow-x-auto px-4">
              {oftenOrdered.map((o) => (
                <OftenOrderedCard key={o.id} item={o} name={pick(o.name)} addedCount={added[o.id] ?? 0} done={flash === o.id} onQuickAdd={() => quickAdd(o)} />
              ))}
            </div>
          </section>
        )}
      </div>
    </BottomSheet>
  );
}

import { useLayoutEffect, useState } from "react";
import { useLocale, useStrings } from "@/shared/i18n";
import { LIMITS, QUICK_ADD_FLASH_MS } from "../../config";
import { partFromOptions, useItemOptions } from "../../hooks/useItemOptions";
import { useMenuState } from "../../hooks/useMenuState";
import { findProduct, isInStock } from "../../lib/catalog";
import { defaultSizeId, makeLine, partUnitPrice } from "../../lib/pricing";
import { strings } from "../../strings";
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
  const { menu, lines, add, updateLine, announce, swapToOrder, close } = useMenuState();
  const item = findProduct(menu, itemId);
  const editing = editKey ? lines.find((line) => line.key === editKey) : undefined;
  const initial = editing?.parts[0];
  const opts = useItemOptions(
    item ?? null,
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

  const inStock = isInStock(item);
  const part = partFromOptions(item, opts);
  const unit = partUnitPrice(item, part);
  const total = unit * qty;
  const name = pick(item.name);

  const submit = () => {
    if (!inStock) return;
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

  const quickAdd = (previewId: string) => {
    const product = findProduct(menu, previewId);
    if (!product || !isInStock(product)) return;
    const part = { productId: product.id, sizeId: defaultSizeId(product), addOnIds: [] };
    add(makeLine("item", product.id, [part], 1));
    setAdded((counts) => ({ ...counts, [product.id]: (counts[product.id] ?? 0) + 1 }));
    setFlash(product.id);
    window.setTimeout(() => setFlash((current) => (current === product.id ? null : current)), QUICK_ADD_FLASH_MS);
    announce(t.a11yAdded(pick(product.name)));
  };

  const label = editing ? t.updateOrder : t.addToOrder;
  const oftenOrdered = item.oftenOrderedWith;

  return (
    <BottomSheet
      isOpen={isOpen}
      label={name}
      onClose={editing ? () => swapToOrder(editing.key) : close}
      footer={inStock ? (
        <AddToOrderBar title={name} qty={qty} max={editing ? LIMITS.lineQty : LIMITS.sheetQty} onQty={setQty} label={label} total={total} onSubmit={submit} />
      ) : undefined}
    >
      <div className="flex flex-col gap-6">
        <div className="px-4">
          <div className="relative">
            <Img image={item.image} alt={name} className={`aspect-4/3 w-full rounded-lg ${inStock ? "" : "grayscale"}`} />
            {!inStock && <span className="absolute end-2 top-2"><Badge kind="outOfStock" /></span>}
          </div>
        </div>
        <div className="flex flex-col gap-2 px-4">
          {inStock && item.badge && <div><Badge kind={item.badge} /></div>}
          <SheetTitle>{name}</SheetTitle>
          <p className="text-small font-medium text-navy/65">{pick(item.description)}</p>
        </div>
        <OptionBlock item={item} name={name} opts={opts} pick={pick} />
        {!editing && oftenOrdered.length > 0 && (
          <section aria-label={t.oftenOrdered} className="flex flex-col gap-2">
            <h3 className="px-4 text-body font-bold">{t.oftenOrdered}</h3>
            <div className="no-scrollbar flex gap-2 overflow-x-auto px-4">
              {oftenOrdered.map((other) => (
                <OftenOrderedCard
                  key={other.id}
                  item={other}
                  name={pick(other.name)}
                  addedCount={added[other.id] ?? 0}
                  done={flash === other.id}
                  onQuickAdd={() => quickAdd(other.id)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </BottomSheet>
  );
}

import { useState } from "react";
import { useLocale, useStrings } from "@/shared/i18n";
import { LIMITS } from "../../config";
import { partFromOptions, useItemOptions } from "../../hooks/useItemOptions";
import { useMenuState } from "../../hooks/useMenuState";
import { findPairing, isInStock } from "../../lib/catalog";
import { bundleUnitPrice, makeLine } from "../../lib/pricing";
import { useMoney } from "../../lib/money";
import { strings } from "../../strings";
import { Chip } from "../atoms/Chip";
import { Img } from "../atoms/Image";
import { AddToOrderBar } from "../molecules/AddToOrderBar";
import { OptionBlock } from "../molecules/OptionBlock";
import { SheetTitle } from "../molecules/SheetTitle";
import { BottomSheet } from "./BottomSheet";

interface Props {
  isOpen: boolean;
  offerId: string;
  editKey?: string;
}

export function OfferSheet({ isOpen, offerId, editKey }: Props) {
  const locale = useLocale();
  const pick = (text: { en: string; ar: string }) => text[locale];
  const t = useStrings(strings);
  const money = useMoney();
  const { menu, lines, add, updateLine, announce, swapToOrder, close } = useMenuState();
  const pairing = findPairing(menu, offerId);
  const editing = editKey ? lines.find((line) => line.key === editKey) : undefined;
  const editingBundle = editing?.kind === "bundle" ? editing : undefined;
  const a = pairing?.items[0];
  const b = pairing?.items[1];
  const optsA = useItemOptions(a ?? null, editingBundle && { sizeId: editingBundle.parts[0].sizeId, addOnIds: editingBundle.parts[0].addOnIds });
  const optsB = useItemOptions(b ?? null, editingBundle && { sizeId: editingBundle.parts[1].sizeId, addOnIds: editingBundle.parts[1].addOnIds });
  const [qty, setQty] = useState(editing?.qty ?? 1);

  if (!pairing || !a || !b) return null;

  const parts = [partFromOptions(a, optsA), partFromOptions(b, optsB)] as [ReturnType<typeof partFromOptions>, ReturnType<typeof partFromOptions>];
  const unit = bundleUnitPrice(pairing, parts);
  const title = `${pick(a.name)} + ${pick(b.name)}`;
  const label = editing ? t.updateOrder : t.addToOrder;
  const available = isInStock(a) && isInStock(b);

  const submit = () => {
    if (!available) return;
    const line = makeLine("bundle", pairing.id, parts, qty);
    if (editing) {
      updateLine(editing.key, { ...line, qty });
      announce(t.a11yOrderUpdated);
      swapToOrder(line.key);
    } else {
      add(line);
      announce(t.a11yAdded(title));
      close();
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      label={title}
      onClose={editing ? () => swapToOrder(editing.key) : close}
      footer={available ? <AddToOrderBar title={title} qty={qty} max={editing ? LIMITS.lineQty : LIMITS.sheetQty} onQty={setQty} label={label} total={unit * qty} onSubmit={submit} /> : undefined}
    >
      <div className="flex flex-col gap-6">
        <div className="flex gap-2 px-4">
          <Img image={a.image} alt={pick(a.name)} className="aspect-square flex-1 rounded-lg" />
          <Img image={b.image} alt={pick(b.name)} className="aspect-square flex-1 rounded-lg" />
        </div>
        <div className="flex flex-col gap-2 px-4">
          {pairing.pricing.hasSavings && <div><Chip kind="savings">{t.saveChip(money(pairing.pricing.savings))}</Chip></div>}
          <SheetTitle>{title}</SheetTitle>
        </div>
        <OptionBlock item={a} name={pick(a.name)} opts={optsA} pick={pick} withProductRow />
        <OptionBlock item={b} name={pick(b.name)} opts={optsB} pick={pick} withProductRow />
      </div>
    </BottomSheet>
  );
}

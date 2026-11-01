import { useState } from "react";
import { useLocale, useStrings } from "@/shared/i18n";
import { LIMITS } from "../../config";
import { partFromOptions, useItemOptions } from "../../hooks/useItemOptions";
import { useMenuState } from "../../hooks/useMenuState";
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
  const { db, lines, add, updateLine, announce, swapToOrder, close } = useMenuState();
  const pairing = db.pairingsById.get(offerId);
  const editing = editKey ? lines.find((l) => l.key === editKey) : undefined;
  const [a, b] = pairing?.items ?? [];
  const addOnsA = a ? (db.addOnsByProduct.get(a.id) ?? []) : [];
  const addOnsB = b ? (db.addOnsByProduct.get(b.id) ?? []) : [];
  const optsA = useItemOptions(a ?? ({} as typeof a extends infer T ? T & object : never), addOnsA, editing && { sizeId: editing.parts[0].sizeId, addOnIds: editing.parts[0].addOnIds });
  const optsB = useItemOptions(b ?? ({} as typeof b extends infer T ? T & object : never), addOnsB, editing && { sizeId: editing.parts[1].sizeId, addOnIds: editing.parts[1].addOnIds });
  const [qty, setQty] = useState(editing?.qty ?? 1);

  if (!pairing || !a || !b) return null;

  const parts = [partFromOptions(a, optsA), partFromOptions(b, optsB)] as [ReturnType<typeof partFromOptions>, ReturnType<typeof partFromOptions>];
  const unit = bundleUnitPrice(pairing, parts, db.addOnsById);
  const title = `${pick(a.name)} + ${pick(b.name)}`;
  const label = editing ? t.updateOrder : t.addToOrder;

  const submit = () => {
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
      footer={<AddToOrderBar title={title} qty={qty} max={editing ? LIMITS.lineQty : LIMITS.sheetQty} onQty={setQty} label={label} total={unit * qty} onSubmit={submit} />}
    >
      <div className="flex flex-col gap-6">
        <div className="flex gap-2 px-4">
          <Img productImage={a.image} categoryId={a.categoryId} alt={pick(a.name)} className="aspect-square flex-1 rounded-lg" />
          <Img productImage={b.image} categoryId={b.categoryId} alt={pick(b.name)} className="aspect-square flex-1 rounded-lg" />
        </div>
        <div className="flex flex-col gap-2 px-4">
          {pairing.savings > 0 && (
            <div>
              <Chip kind="savings">{t.saveChip(money(pairing.savings))}</Chip>
            </div>
          )}
          <SheetTitle>{title}</SheetTitle>
        </div>
        <OptionBlock item={a} name={pick(a.name)} opts={optsA} pick={pick} pickSize={(id) => pick(db.sizesById.get(id)?.name ?? { en: id, ar: id })} withProductRow />
        <OptionBlock item={b} name={pick(b.name)} opts={optsB} pick={pick} pickSize={(id) => pick(db.sizesById.get(id)?.name ?? { en: id, ar: id })} withProductRow />
      </div>
    </BottomSheet>
  );
}

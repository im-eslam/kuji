import { useState } from "react";
import { useLocale, useStrings } from "@/shared/i18n";
import { defaultChoice, lineTitle, makeLine, MAX_QTY_IN_CART, MAX_QTY_IN_SHEET, priceOf, type CartLine, type Choice } from "../hooks/useCart";
import { strings, useMoney } from "../localization/strings";
import type { Pairing } from "../data/types";
import { BottomSheet } from "./BottomSheet";
import { ProductOptions } from "./ProductOptions";
import { AddToCartBar, Chip, Img } from "./ui";

interface Props {
  pairing: Pairing;
  /** The cart line being edited, or null when the customer is adding something new. */
  editing: CartLine | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (line: CartLine) => void;
}

/**
 * A pairing is two products sold together, so this sheet shows the options of both.
 * Like ProductSheet, its choices are state here, and the parent gives it a new `key` for every opening.
 */
export function PairingSheet({ pairing, editing, isOpen, onClose, onSubmit }: Props) {
  const t = useStrings(strings);
  const locale = useLocale();
  const money = useMoney();
  const [choices, setChoices] = useState<Choice[]>(editing?.choices ?? pairing.items.map((product) => defaultChoice(product)));
  const [qty, setQty] = useState(editing?.qty ?? 1);

  const [first, second] = pairing.items;
  const title = lineTitle(choices, locale);
  const available = pairing.items.every((product) => product.availability === "in_stock");
  const total = priceOf(pairing, choices).current * qty;

  function changeChoice(index: number, choice: Choice) {
    setChoices((current) => current.map((c, i) => (i === index ? choice : c)));
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      label={title}
      onClose={onClose}
      footer={
        available && (
          <AddToCartBar
            title={title}
            qty={qty}
            max={editing ? MAX_QTY_IN_CART : MAX_QTY_IN_SHEET}
            onQty={setQty}
            label={editing ? t.updateOrder : t.addToOrder}
            total={total}
            onSubmit={() => onSubmit(makeLine(pairing, choices, qty))}
          />
        )
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex gap-2 px-4">
          <Img image={first.image} alt={first.name[locale]} className="aspect-square flex-1 rounded-lg" />
          <Img image={second.image} alt={second.name[locale]} className="aspect-square flex-1 rounded-lg" />
        </div>

        <div className="flex flex-col gap-2 px-4">
          {pairing.pricing.hasSavings && (
            <div>
              <Chip kind="savings">{t.saveChip(money(pairing.pricing.savings))}</Chip>
            </div>
          )}
          <h2 data-sheet-title className="text-title font-bold">
            {title}
          </h2>
        </div>

        {choices.map((choice, index) => (
          <ProductOptions key={index} choice={choice} onChange={(next) => changeChoice(index, next)} showProduct />
        ))}
      </div>
    </BottomSheet>
  );
}

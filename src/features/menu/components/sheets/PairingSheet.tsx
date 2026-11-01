import { useState } from "react";
import { useLocale, useStrings } from "@/shared/i18n";
import { defaultChoice, lineTitle, makeLine, MAX_QTY_IN_CART, MAX_QTY_IN_SHEET, priceOf, type CartLine, type Choice } from "../../hooks/useCart";
import { strings, useMoney } from "../../localization/strings";
import type { Pairing } from "../../data/types";
import { ProductOptions } from "../products/ProductOptions";
import { AddToCartBar, Badge, Chip, cx, Img, PrimaryButton } from "../shared/ui";
import { BottomSheet } from "./BottomSheet";

interface Props {
  pairing: Pairing;
  /** The cart line being edited, or null when the customer is adding something new. */
  editing: CartLine | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (line: CartLine) => void;
}

const styles = {
  content: "flex flex-col gap-6",
  pictures: "flex gap-2 px-4",
  picture: "aspect-square flex-1 rounded-lg",
  intro: "flex flex-col items-start gap-2 px-4",
  title: "text-title font-bold text-balance",
};

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

  const title = lineTitle(choices, locale);
  const available = pairing.items.every((product) => product.availability === "in_stock");
  const total = priceOf(pairing, choices).current * qty;

  function changeChoice(index: number, choice: Choice) {
    setChoices((current) => current.map((c, i) => (i === index ? choice : c)));
  }

  const footer = available ? (
    <AddToCartBar
      title={title}
      qty={qty}
      max={editing ? MAX_QTY_IN_CART : MAX_QTY_IN_SHEET}
      onQty={setQty}
      label={editing ? t.updateOrder : t.addToOrder}
      total={total}
      onSubmit={() => onSubmit(makeLine(pairing, choices, qty))}
    />
  ) : (
    <PrimaryButton isDisabled>{t.outOfStock}</PrimaryButton>
  );

  return (
    <BottomSheet isOpen={isOpen} label={title} onClose={onClose} footer={footer}>
      <div className={styles.content}>
        <div className={styles.pictures}>
          {pairing.items.map((product) => (
            <Img
              key={product.id}
              image={product.image}
              alt={product.name[locale]}
              className={cx(styles.picture, product.availability === "out_of_stock" && "grayscale")}
            />
          ))}
        </div>

        <div className={styles.intro}>
          {!available && <Badge kind="outOfStock" />}
          {available && pairing.pricing.hasSavings && <Chip kind="savings">{t.saveChip(money(pairing.pricing.savings))}</Chip>}
          <h2 data-sheet-title className={styles.title}>
            {title}
          </h2>
        </div>

        {choices.map((choice, index) => (
          <ProductOptions key={index} choice={choice} onChange={(next) => changeChoice(index, next)} showProduct isDisabled={!available} />
        ))}
      </div>
    </BottomSheet>
  );
}

import { useEffect, useRef, useState } from "react";
import { useLocale, useStrings } from "@/shared/i18n";
import { useMenuState } from "../../hooks/useMenuState";
import { strings } from "../../strings";
import type { OrderLine } from "../../types";
import { PrimaryButton } from "../atoms/PrimaryButton";
import { Price } from "../atoms/Price";
import { Rolling } from "../atoms/Rolling";
import { SecondaryButton } from "../atoms/SecondaryButton";
import { ClearConfirmation } from "../molecules/ClearConfirmation";
import { OrderLineBundle } from "../molecules/OrderLineBundle";
import { OrderLineItem } from "../molecules/OrderLineItem";
import { SheetTitle } from "../molecules/SheetTitle";
import { BottomSheet } from "./BottomSheet";

interface Props {
  isOpen: boolean;
}

export function OrderSheet({ isOpen }: Props) {
  const locale = useLocale();
  const pick = (text: { en: string; ar: string }) => text[locale];
  const t = useStrings(strings);
  const { db, lines, count, subtotal, setQty, removeLine, editLine, clearOrder, announce, focusLineKey, clearFocusLine, close } =
    useMenuState();
  const [confirming, setConfirming] = useState(false);
  const clearWrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!focusLineKey) return;
    const id = window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(`[data-line-key="${CSS.escape(focusLineKey)}"]`)?.focus();
      clearFocusLine();
    });
    return () => window.cancelAnimationFrame(id);
  }, [focusLineKey, clearFocusLine]);

  useEffect(() => {
    if (isOpen) setConfirming(false);
  }, [isOpen]);

  const empty = lines.length === 0;
  const countLabel = count === 1 ? t.itemsCountOne : t.itemsCount(count);
  const setLineQty = (line: OrderLine, qty: number) => setQty(line.key, qty);
  const remove = (line: OrderLine) => removeLine(line.key);

  // The footer keeps one fixed layout. The confirmation is laid over it (same spot, bottom-anchored) so asking
  // "Clear your whole order?" never changes the footer's height and nothing above it moves.
  const footer = empty ? undefined : (
    <div className="relative">
      <div
        aria-hidden={confirming}
        {...(confirming ? ({ inert: "" } as object) : {})}
        className={`flex flex-col gap-3 transition-opacity duration-200 ${confirming ? "opacity-0" : "opacity-100"}`}
      >
        <div className="flex items-baseline justify-between">
          <span className="text-body font-bold">{t.subtotal}</span>
          <Price value={subtotal} size="heading" rolling />
        </div>
        <div ref={clearWrap} className="flex flex-col">
          <SecondaryButton onPress={() => setConfirming(true)}>{t.clearOrder}</SecondaryButton>
        </div>
      </div>
      {confirming && (
        <div className="absolute inset-x-0 bottom-0 z-10 bg-white">
          <ClearConfirmation
            onKeep={() => {
              setConfirming(false);
              window.requestAnimationFrame(() => clearWrap.current?.querySelector("button")?.focus());
            }}
            onClear={() => {
              clearOrder();
              setConfirming(false);
              announce(t.emptyOrder);
            }}
          />
        </div>
      )}
    </div>
  );

  return (
    <BottomSheet isOpen={isOpen} label={t.yourOrder} onClose={close} footer={footer}>
      <div className="flex min-h-12 items-center ps-4 pe-14">
        <div>
          <SheetTitle>{t.yourOrder}</SheetTitle>
          {!empty && (
            <p aria-live="polite" className="text-caption font-medium text-navy/65">
              <Rolling text={countLabel} />
            </p>
          )}
        </div>
      </div>
      {empty ? (
        <div className="flex flex-col items-center gap-4 px-4 py-8 text-center">
          <p className="text-heading font-bold">{t.emptyOrder}</p>
          <p className="text-small font-medium text-navy/65">{t.emptyOrderHint}</p>
          <PrimaryButton onPress={close} short className="w-auto px-6">
            {t.browseMenu}
          </PrimaryButton>
        </div>
      ) : (
        <div className="pt-4">
          {lines.map((line) =>
            line.kind === "item" ? (
              <OrderLineItem key={line.key} line={line} db={db} pick={pick} onEdit={editLine} onSetQty={setLineQty} onRemove={remove} />
            ) : (
              <OrderLineBundle key={line.key} line={line} db={db} pick={pick} onEdit={editLine} onSetQty={setLineQty} onRemove={remove} />
            ),
          )}
        </div>
      )}
    </BottomSheet>
  );
}

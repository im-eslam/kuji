import { useRef, useState } from "react";
import { Button } from "react-aria-components";
import { useLocale, useStrings } from "@/shared/i18n";
import { lineTitle, MAX_QTY_IN_CART, priceOf, type CartLine } from "../hooks/useCart";
import { strings } from "../localization/strings";
import { BottomSheet } from "./BottomSheet";
import { Chevron, Chip, Img, Price, PrimaryButton, Rolling, SecondaryButton, Stepper } from "./ui";

/** How long a removed row takes to fold away, before it is really removed from the cart. */
const REMOVE_ROW_MS = 220;

interface Props {
  isOpen: boolean;
  lines: CartLine[];
  count: number;
  subtotal: number;
  /** The row whose "edit" button gets keyboard focus when the cart opens (the row the customer just edited). */
  focusKey: string | null;
  onClose: () => void;
  onEdit: (line: CartLine) => void;
  onSetQty: (key: string, qty: number) => void;
  onRemove: (key: string) => void;
  onClear: () => void;
}

/** The customer's order: every line with its quantity, the subtotal, and "Clear order". */
export function CartSheet({ isOpen, lines, count, subtotal, focusKey, onClose, onEdit, onSetQty, onRemove, onClear }: Props) {
  const t = useStrings(strings);
  const empty = lines.length === 0;

  return (
    <BottomSheet isOpen={isOpen} label={t.yourOrder} onClose={onClose} footer={!empty && <CartFooter subtotal={subtotal} onClear={onClear} />}>
      <div className="flex min-h-12 items-center px-4">
        <div>
          <h2 data-sheet-title className="text-title font-bold">
            {t.yourOrder}
          </h2>
          {!empty && (
            <p aria-live="polite" className="text-caption font-medium text-navy/65">
              <Rolling text={count === 1 ? t.itemsCountOne : t.itemsCount(count)} />
            </p>
          )}
        </div>
      </div>

      {empty ? (
        <div className="flex flex-col items-center gap-4 px-4 py-8 text-center">
          <p className="text-heading font-bold">{t.emptyOrder}</p>
          <p className="text-small font-medium text-navy/65">{t.emptyOrderHint}</p>
          <PrimaryButton onPress={onClose} short className="w-auto px-6">
            {t.browseMenu}
          </PrimaryButton>
        </div>
      ) : (
        <div className="pt-4">
          {lines.map((line) => (
            <CartRow key={line.key} line={line} autoFocusEdit={line.key === focusKey} onEdit={onEdit} onSetQty={onSetQty} onRemove={onRemove} />
          ))}
        </div>
      )}
    </BottomSheet>
  );
}

/**
 * Subtotal and "Clear order". Asking "Clear your whole order?" is drawn over the same spot, so the footer
 * never changes height and nothing above it moves. This is its own component so it starts fresh each time the cart opens.
 */
function CartFooter({ subtotal, onClear }: { subtotal: number; onClear: () => void }) {
  const t = useStrings(strings);
  const [confirming, setConfirming] = useState(false);
  const clearButton = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative">
      <div inert={confirming} aria-hidden={confirming} className={`flex flex-col gap-3 transition-opacity duration-200 ${confirming ? "opacity-0" : "opacity-100"}`}>
        <div className="flex items-baseline justify-between">
          <span className="text-body font-bold">{t.subtotal}</span>
          <Price value={subtotal} size="heading" rolling />
        </div>
        <SecondaryButton ref={clearButton} onPress={() => setConfirming(true)}>
          {t.clearOrder}
        </SecondaryButton>
      </div>

      {confirming && (
        <div className="absolute inset-x-0 bottom-0 z-10 flex animate-fade-in flex-col gap-4 bg-white">
          <p className="text-body font-semibold">{t.clearQuestion}</p>
          <div className="flex gap-2">
            <Button
              autoFocus
              onPress={() => {
                setConfirming(false);
                requestAnimationFrame(() => clearButton.current?.focus());
              }}
              className="flex h-12 flex-1 items-center justify-center rounded-full border border-arctic px-4 text-center text-small font-semibold data-pressed:bg-mist"
            >
              {t.keepOrder}
            </Button>
            <Button
              onPress={onClear}
              className="flex h-12 flex-1 items-center justify-center rounded-full bg-navy px-4 text-center text-small font-semibold text-white transition-transform duration-150 ease-out data-pressed:scale-[0.98]"
            >
              {t.clearOrder}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/** One line of the order: picture, name, chosen size and add-ons, its price, and a quantity stepper. */
function CartRow({ line, autoFocusEdit, onEdit, onSetQty, onRemove }: {
  line: CartLine;
  autoFocusEdit: boolean;
  onEdit: (line: CartLine) => void;
  onSetQty: (key: string, qty: number) => void;
  onRemove: (key: string) => void;
}) {
  const t = useStrings(strings);
  const locale = useLocale();
  const [leaving, setLeaving] = useState(false);

  const title = lineTitle(line.choices, locale);
  const { current, regular } = priceOf(line.pairing, line.choices);

  // The row folds away first, and only then is it taken out of the cart.
  function remove() {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(() => onRemove(line.key), REMOVE_ROW_MS);
  }

  return (
    <div
      style={{ transitionDuration: `${REMOVE_ROW_MS}ms, 140ms` }}
      className={`grid transition-[grid-template-rows,opacity] ease-[var(--ease-smooth)] ${leaving ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"}`}
    >
      <div className="min-h-0 overflow-hidden">
        <div aria-hidden="true" className="h-px w-full bg-mist" />
        <div className="grid grid-cols-[4rem_minmax(0,1fr)] gap-x-3 gap-y-1 px-4 py-3">
          {/* The picture, the name and the chips together open the editor. The stepper is a separate control. */}
          <div aria-hidden="true" onClick={() => onEdit(line)} className="row-span-2 cursor-pointer self-start">
            <span className="flex size-16 shrink-0 gap-1">
              {line.choices.map((choice, i) => (
                <Img key={i} image={choice.product.image} className="h-full flex-1 rounded-md" />
              ))}
            </span>
          </div>

          <Button
            autoFocus={autoFocusEdit}
            aria-label={t.a11yEdit(title)}
            onPress={() => onEdit(line)}
            className="flex min-w-0 flex-col gap-1 rounded-md text-start transition-colors duration-150 data-pressed:bg-mist"
          >
            <span className="flex items-start justify-between gap-2">
              <span className="text-body font-semibold">{title}</span>
              <Chevron small />
            </span>
            <span className="flex flex-col gap-1">
              {line.choices.map((choice, i) => {
                const chips = [...(choice.size ? [choice.size.name[locale]] : []), ...choice.addOns.map((addOn) => addOn.name[locale])];
                if (chips.length === 0) return null;
                return (
                  <span key={i} className="flex flex-wrap items-center gap-1">
                    {/* In a pairing, say which of the two products the chips belong to. */}
                    {line.pairing && <span className="text-caption font-medium text-navy/65">{choice.product.name[locale]}</span>}
                    {chips.map((chip, n) => (
                      <Chip key={n} compact>
                        {chip}
                      </Chip>
                    ))}
                  </span>
                );
              })}
            </span>
          </Button>

          <div className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 flex-wrap items-baseline gap-x-2">
              <Price value={current * line.qty} size="body" rolling />
              {regular !== null && <Price value={regular * line.qty} size="caption" struck />}
            </span>
            <Stepper size="sm" value={line.qty} min={1} max={MAX_QTY_IN_CART} title={title} onChange={(qty) => onSetQty(line.key, qty)} onRemove={remove} />
          </div>
        </div>
      </div>
    </div>
  );
}

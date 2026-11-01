import { useRef, useState, type KeyboardEvent } from "react";
import { Button } from "react-aria-components";
import { useLocale, useStrings } from "@/shared/i18n";
import {
  lineTitle,
  MAX_QTY_IN_CART,
  priceOf,
  type CartLine,
} from "../../hooks/useCart";
import { strings } from "../../localization/strings";
import { BottomSheet } from "../sheets/BottomSheet";
import {
  Chevron,
  Chip,
  cx,
  focusRing,
  Img,
  Price,
  PrimaryButton,
  Rolling,
  SecondaryButton,
  SheetTitle,
  Stepper,
} from "../shared/ui";

const REMOVE_ROW_MS = 220;

interface Props {
  isOpen: boolean;
  lines: CartLine[];
  count: number;
  subtotal: number;
  focusKey: string | null;
  onClose: () => void;
  onEdit: (line: CartLine) => void;
  onSetQty: (key: string, qty: number) => void;
  onRemove: (key: string) => void;
  onClear: () => void;
}

const styles = {
  heading: "flex min-h-12 flex-col justify-center px-4",
  itemCount: "text-caption font-medium text-navy/65",
  list: "pt-4",
  empty: "flex flex-col items-center gap-3 px-4 py-10 text-center",
  emptyTitle: "text-heading font-bold text-balance",
  emptyHint: "max-w-xs text-small font-medium text-pretty text-navy/65",
  emptyAction: "mt-2 px-6",
};

export function CartSheet({
  isOpen,
  lines,
  count,
  subtotal,
  focusKey,
  onClose,
  onEdit,
  onSetQty,
  onRemove,
  onClear,
}: Props) {
  const t = useStrings(strings);
  const empty = lines.length === 0;

  return (
    <BottomSheet
      isOpen={isOpen}
      label={t.yourOrder}
      onClose={onClose}
      footer={!empty && <CartFooter subtotal={subtotal} onClear={onClear} />}
    >
      <div className={styles.heading}>
        <SheetTitle>{t.yourOrder}</SheetTitle>
        {!empty && (
          <p aria-live="polite" className={styles.itemCount}>
            <Rolling
              text={count === 1 ? t.itemsCountOne : t.itemsCount(count)}
            />
          </p>
        )}
      </div>

      {empty ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>{t.emptyOrder}</p>
          <p className={styles.emptyHint}>{t.emptyOrderHint}</p>
          <PrimaryButton
            short
            width="auto"
            onPress={onClose}
            className={styles.emptyAction}
          >
            {t.browseMenu}
          </PrimaryButton>
        </div>
      ) : (
        <div className={styles.list}>
          {lines.map((line) => (
            <CartRow
              key={line.key}
              line={line}
              autoFocusEdit={line.key === focusKey}
              onEdit={onEdit}
              onSetQty={onSetQty}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </BottomSheet>
  );
}

const footerStyles = {
  root: "relative",
  main: "flex flex-col gap-3 transition-opacity duration-200",
  mainVisible: "opacity-100",
  mainHidden: "opacity-0",
  subtotal: "flex items-baseline justify-between gap-3",
  subtotalLabel: "text-body font-bold",
  confirm:
    "absolute inset-x-0 bottom-0 z-10 flex animate-fade-in flex-col gap-4 bg-white",
  confirmText: "text-body font-semibold text-balance",
  confirmButtons: "flex gap-2",
  keep: cx(
    "flex h-12 flex-1 items-center justify-center rounded-full border border-arctic px-4 text-center text-small font-semibold data-hovered:bg-mist/60 data-pressed:bg-mist",
    focusRing,
  ),
  clear: cx(
    "flex h-12 flex-1 items-center justify-center rounded-full bg-navy px-4 text-center text-small font-semibold text-white transition-transform duration-150 ease-out data-pressed:scale-[0.98]",
    "outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-yellow",
  ),
};

function CartFooter({
  subtotal,
  onClear,
}: {
  subtotal: number;
  onClear: () => void;
}) {
  const t = useStrings(strings);
  const [confirming, setConfirming] = useState(false);
  const clearButton = useRef<HTMLButtonElement>(null);

  function cancel() {
    setConfirming(false);
    requestAnimationFrame(() => clearButton.current?.focus());
  }

  function onConfirmKeyDown(event: KeyboardEvent) {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    cancel();
  }

  return (
    <div className={footerStyles.root}>
      <div
        inert={confirming}
        aria-hidden={confirming}
        className={cx(
          footerStyles.main,
          confirming ? footerStyles.mainHidden : footerStyles.mainVisible,
        )}
      >
        <div className={footerStyles.subtotal}>
          <span className={footerStyles.subtotalLabel}>{t.subtotal}</span>
          <Price value={subtotal} size="heading" rolling />
        </div>
        <SecondaryButton ref={clearButton} onPress={() => setConfirming(true)}>
          {t.clearOrder}
        </SecondaryButton>
      </div>

      {confirming && (
        <div
          role="group"
          aria-label={t.clearQuestion}
          onKeyDown={onConfirmKeyDown}
          className={footerStyles.confirm}
        >
          <p className={footerStyles.confirmText}>{t.clearQuestion}</p>
          <div className={footerStyles.confirmButtons}>
            <Button autoFocus onPress={cancel} className={footerStyles.keep}>
              {t.keepOrder}
            </Button>
            <Button onPress={onClear} className={footerStyles.clear}>
              {t.clearOrder}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

const rowStyles = {
  fold: "grid transition-[grid-template-rows,opacity] ease-[var(--ease-smooth)]",
  foldOpen: "grid-rows-[1fr] opacity-100",
  foldClosed: "grid-rows-[0fr] opacity-0",
  clip: "min-h-0 overflow-hidden",
  divider: "h-px w-full bg-mist",
  row: "flex flex-col gap-2 px-4 py-3",

  edit: cx(
    "group flex w-full items-start gap-3 rounded-md text-start",
    focusRing,
  ),
  thumbs: "flex size-16 shrink-0 gap-1",
  thumb: "h-full flex-1 rounded-md",
  details: "flex min-w-0 flex-1 flex-col gap-1",
  titleRow: "flex items-start justify-between gap-2",
  title: "min-w-0 text-body font-semibold text-balance",
  chipGroup: "flex flex-wrap items-center gap-1",
  chipOwner: "text-caption font-medium text-navy/65",

  bottom: "ms-19 flex items-center justify-between gap-3",
  prices: "flex min-w-0 flex-wrap items-baseline gap-x-2",
};

function CartRow({
  line,
  autoFocusEdit,
  onEdit,
  onSetQty,
  onRemove,
}: {
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

  function remove() {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(() => onRemove(line.key), REMOVE_ROW_MS);
  }

  return (
    <div
      style={{ transitionDuration: `${REMOVE_ROW_MS}ms, 140ms` }}
      className={cx(
        rowStyles.fold,
        leaving ? rowStyles.foldClosed : rowStyles.foldOpen,
      )}
    >
      <div className={rowStyles.clip}>
        <div aria-hidden="true" className={rowStyles.divider} />
        <div className={rowStyles.row}>
          <Button
            autoFocus={autoFocusEdit}
            aria-label={t.a11yEdit(title)}
            onPress={() => onEdit(line)}
            className={rowStyles.edit}
          >
            <span className={rowStyles.thumbs}>
              {line.choices.map((choice, i) => (
                <Img
                  key={i}
                  image={choice.product.image}
                  className={rowStyles.thumb}
                />
              ))}
            </span>
            <span className={rowStyles.details}>
              <span className={rowStyles.titleRow}>
                <span className={rowStyles.title}>{title}</span>
                <Chevron small />
              </span>
              {line.choices.map((choice, i) => {
                const chips = [
                  ...(choice.size ? [choice.size.name[locale]] : []),
                  ...choice.addOns.map((addOn) => addOn.name[locale]),
                ];
                if (chips.length === 0) return null;
                return (
                  <span key={i} className={rowStyles.chipGroup}>
                    {line.pairing && (
                      <span className={rowStyles.chipOwner}>
                        {choice.product.name[locale]}
                      </span>
                    )}
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

          <div className={rowStyles.bottom}>
            <span className={rowStyles.prices}>
              <Price value={current * line.qty} size="body" rolling />
              {regular !== null && (
                <Price value={regular * line.qty} size="caption" struck />
              )}
            </span>
            <Stepper
              size="sm"
              value={line.qty}
              min={1}
              max={MAX_QTY_IN_CART}
              title={title}
              onChange={(qty) => onSetQty(line.key, qty)}
              onRemove={remove}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

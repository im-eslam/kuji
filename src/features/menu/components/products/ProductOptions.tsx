import type { CSSProperties } from "react";
import {
  Checkbox,
  CheckboxGroup,
  Label,
  Radio,
  RadioGroup,
  ToggleButton,
} from "react-aria-components";
import { useLocale, useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import type { Choice } from "../../hooks/useCart";
import { strings, useMoney } from "../../localization/strings";
import { Badge, cx, focusRing, focusRingInset, Img, Price } from "../shared/ui";

interface Props {
  choice: Choice;
  onChange: (choice: Choice) => void;
  showProduct?: boolean;
  isDisabled?: boolean;
}

const styles = {
  root: "flex flex-col gap-4",

  productHeader: "flex items-center gap-3 px-4",
  productImage: "size-12 shrink-0 rounded-md",
  productName: "min-w-0 flex-1 text-body font-semibold text-balance",

  group: "flex flex-col gap-2 px-4",
  groupLabel: "text-body font-bold",

  segments:
    "relative grid auto-cols-fr grid-flow-col gap-1 rounded-full bg-mist p-1 [--dir:1] rtl:[--dir:-1]",
  segmentPill:
    "absolute inset-y-1 start-1 rounded-full bg-navy transition-transform duration-220 ease-[var(--ease-smooth)]",
  segment: cx(
    "group relative flex min-h-10 items-center justify-center rounded-full px-2 py-1 text-center text-navy/65 transition-colors duration-220 ease-[var(--ease-smooth)]",
    "data-selected:text-white data-disabled:opacity-50",
    focusRing,
  ),
  segmentText: "flex flex-col items-center leading-tight",
  segmentName: "text-small font-medium group-data-selected:font-semibold",
  segmentPrice: "flex items-baseline gap-1 text-caption tabular-nums",
  segmentOldPrice:
    "font-medium text-navy/55 line-through group-data-selected:text-white/70",

  barista: cx(
    "group flex min-h-14 w-full items-center gap-3 rounded-lg bg-arctic px-4 py-2 text-start transition-[background-color,box-shadow] duration-200 ease-out",
    "data-selected:bg-yellow data-selected:ring-2 data-selected:ring-inset data-selected:ring-navy data-disabled:opacity-50",
    focusRing,
  ),
  baristaIcon: "size-6 shrink-0",
  baristaText: "flex min-w-0 flex-1 flex-col",
  baristaTitle: "text-small font-bold",
  baristaSub: "text-caption font-medium",
  baristaCheck:
    "flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-navy transition-colors duration-200 group-data-selected:bg-navy group-data-selected:text-yellow",

  addOnsLabel: "px-4 pb-2 text-body font-bold",
  addOn: cx(
    "group flex min-h-14 w-full items-center gap-4 border-b border-mist px-4 py-2 text-start transition-colors duration-150",
    "data-pressed:bg-mist data-disabled:opacity-50",
    focusRingInset,
  ),
  addOnBox:
    "flex size-6 shrink-0 items-center justify-center rounded-sm border-2 border-navy transition-colors duration-150 group-data-selected:bg-yellow",
  addOnName:
    "min-w-0 flex-1 text-body font-medium group-data-selected:font-semibold",
  addOnPrice: "shrink-0 text-end",

  tick: "size-4 scale-50 opacity-0 transition-[opacity,transform] duration-150 ease-out group-data-selected:scale-100 group-data-selected:opacity-100",
};

export function ProductOptions({
  choice,
  onChange,
  showProduct,
  isDisabled,
}: Props) {
  const t = useStrings(strings);
  const locale = useLocale();
  const money = useMoney();
  const { product, size, addOns } = choice;

  const baristaIds = (product.baristaWay?.addOns ?? []).map(
    (addOn) => addOn.id,
  );
  const selectedIds = addOns.map((addOn) => addOn.id);
  const baristaOn =
    baristaIds.length > 0 && baristaIds.every((id) => selectedIds.includes(id));

  const hasSizes = product.sizes.length > 0;
  const hasAddOns = product.addOns.length > 0;
  const hasBarista = baristaIds.length > 0;
  if (!hasSizes && !hasAddOns && !hasBarista) return null;

  function selectAddOns(ids: string[]) {
    onChange({
      ...choice,
      addOns: product.addOns.filter((addOn) => ids.includes(addOn.id)),
    });
  }

  function toggleBarista() {
    selectAddOns(
      baristaOn
        ? selectedIds.filter((id) => !baristaIds.includes(id))
        : [...selectedIds, ...baristaIds],
    );
  }

  const sizeIndex = Math.max(
    0,
    product.sizes.findIndex((s) => s.id === size?.id),
  );
  const name = product.name[locale];
  const pillStyle = {
    "--n": product.sizes.length,
    "--i": sizeIndex,
    width: "calc((100% - 0.25rem * (var(--n) - 1)) / var(--n))",
    transform: "translateX(calc(var(--dir) * var(--i) * (100% + 0.25rem)))",
  } as CSSProperties;

  return (
    <section aria-label={name} className={styles.root}>
      {showProduct && (
        <div className={styles.productHeader}>
          <Img
            image={product.image}
            className={cx(
              styles.productImage,
              product.availability === "out_of_stock" && "grayscale",
            )}
          />
          <h3 className={styles.productName}>{name}</h3>
          {product.availability === "out_of_stock" && (
            <Badge kind="outOfStock" compact />
          )}
        </div>
      )}

      {hasSizes && (
        <RadioGroup
          value={size?.id}
          onChange={(id) =>
            onChange({
              ...choice,
              size: product.sizes.find((s) => s.id === id) ?? null,
            })
          }
          orientation="horizontal"
          isDisabled={isDisabled}
          className={styles.group}
        >
          <Label className={styles.groupLabel}>{t.size}</Label>
          <div className={styles.segments}>
            <span
              aria-hidden="true"
              className={styles.segmentPill}
              style={pillStyle}
            />
            {product.sizes.map((s) => (
              <Radio key={s.id} value={s.id} className={styles.segment}>
                <span className={styles.segmentText}>
                  <span className={styles.segmentName}>{s.name[locale]}</span>
                  <span className={styles.segmentPrice}>
                    {s.pricing.regular !== null && (
                      <span className={styles.segmentOldPrice}>
                        {money(s.pricing.regular)}
                      </span>
                    )}
                    <span>{money(s.pricing.current)}</span>
                  </span>
                </span>
              </Radio>
            ))}
          </div>
        </RadioGroup>
      )}

      {hasBarista && (
        <div className="px-4">
          <ToggleButton
            isSelected={baristaOn}
            onChange={toggleBarista}
            isDisabled={isDisabled}
            className={styles.barista}
          >
            <Icon name="sparkle" className={styles.baristaIcon} />
            <span className={styles.baristaText}>
              <span className={styles.baristaTitle}>{t.baristaWay}</span>
              <span className={styles.baristaSub}>{t.baristaSub}</span>
            </span>
            <span aria-hidden="true" className={styles.baristaCheck}>
              <Icon name="check" className={styles.tick} />
            </span>
          </ToggleButton>
        </div>
      )}

      {hasAddOns && (
        <CheckboxGroup
          value={selectedIds}
          onChange={selectAddOns}
          isDisabled={isDisabled}
        >
          <Label className={styles.addOnsLabel}>{t.addOns}</Label>
          {product.addOns.map((addOn) => (
            <Checkbox key={addOn.id} value={addOn.id} className={styles.addOn}>
              <span aria-hidden="true" className={styles.addOnBox}>
                <Icon name="check" className={styles.tick} />
              </span>
              <span className={styles.addOnName}>{addOn.name[locale]}</span>
              <span className={styles.addOnPrice}>
                <Price value={addOn.price} plus size="small" />
              </span>
            </Checkbox>
          ))}
        </CheckboxGroup>
      )}
    </section>
  );
}

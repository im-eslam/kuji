import type { CSSProperties } from "react";
import { Checkbox, CheckboxGroup, Radio, RadioGroup, ToggleButton } from "react-aria-components";
import { useLocale, useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import type { Choice } from "../hooks/useCart";
import { strings, useMoney } from "../localization/strings";
import { Img, Price, Swap } from "./ui";

interface Props {
  /** The product and what is picked so far. */
  choice: Choice;
  onChange: (choice: Choice) => void;
  /** In a pairing there are two of these blocks, so each one starts with its product's picture and name. */
  showProduct?: boolean;
}

/** The size, "Barista's Way" and add-on choices of one product. The backend decides which ones each product has. */
export function ProductOptions({ choice, onChange, showProduct }: Props) {
  const t = useStrings(strings);
  const locale = useLocale();
  const money = useMoney();
  const { product, size, addOns } = choice;

  const baristaIds = (product.baristaWay?.addOns ?? []).map((addOn) => addOn.id);
  const selectedIds = addOns.map((addOn) => addOn.id);
  // "Barista's Way" is simply "all of the barista add-ons are ticked", so it needs no state of its own.
  const baristaOn = baristaIds.length > 0 && baristaIds.every((id) => selectedIds.includes(id));

  if (product.sizes.length === 0 && product.addOns.length === 0 && baristaIds.length === 0) return null;

  function selectAddOns(ids: string[]) {
    onChange({ ...choice, addOns: product.addOns.filter((addOn) => ids.includes(addOn.id)) });
  }

  function toggleBarista() {
    selectAddOns(baristaOn ? selectedIds.filter((id) => !baristaIds.includes(id)) : [...selectedIds, ...baristaIds]);
  }

  const sizeIndex = Math.max(0, product.sizes.findIndex((s) => s.id === size?.id));
  const name = product.name[locale];

  return (
    <section aria-label={name} className="flex flex-col gap-4">
      {showProduct && (
        <div className="flex items-center gap-3 px-4">
          <Img image={product.image} className="size-12 shrink-0 rounded-md" />
          <h3 className="text-body font-semibold">{name}</h3>
        </div>
      )}

      {product.sizes.length > 0 && (
        <div className="flex flex-col gap-2 px-4">
          <span className="text-body font-bold">{t.size}</span>
          <RadioGroup
            aria-label={t.size}
            value={size?.id}
            onChange={(id) => onChange({ ...choice, size: product.sizes.find((s) => s.id === id) ?? null })}
            orientation="horizontal"
          >
            <div className="relative grid h-12 grid-flow-col auto-cols-fr gap-1 rounded-full bg-mist p-1" style={{ "--n": product.sizes.length } as CSSProperties}>
              {/* The navy pill that slides to the chosen size. */}
              <span
                aria-hidden="true"
                className="absolute inset-y-1 rounded-full bg-navy transition-transform duration-220 ease-[var(--ease-smooth)]"
                style={{ width: "calc((100% - 0.25rem * (var(--n) - 1)) / var(--n))", transform: `translateX(calc(${sizeIndex} * (100% + 0.25rem)))` }}
              />
              {product.sizes.map((s) => (
                <Radio
                  key={s.id}
                  value={s.id}
                  className="group relative flex items-center justify-center whitespace-nowrap rounded-full px-2 text-center text-small font-medium text-navy/65 outline-none transition-colors duration-220 ease-[var(--ease-smooth)] data-selected:font-semibold data-selected:text-white"
                >
                  <span className="flex flex-col items-center leading-tight">
                    <span className="text-caption">{s.name[locale]}</span>
                    <span className="flex items-baseline gap-1 text-caption">
                      {s.pricing.regular !== null && <span className="font-medium text-navy/55 line-through group-data-selected:text-white/70">{money(s.pricing.regular)}</span>}
                      <span>{money(s.pricing.current)}</span>
                    </span>
                  </span>
                </Radio>
              ))}
            </div>
          </RadioGroup>
        </div>
      )}

      {baristaIds.length > 0 && (
        <div className="px-4">
          <ToggleButton
            isSelected={baristaOn}
            onChange={toggleBarista}
            className={`flex h-14 w-full items-center gap-3 rounded-lg px-4 text-start transition-[background-color,box-shadow] duration-200 ease-out ${
              baristaOn ? "bg-yellow ring-2 ring-inset ring-navy" : "bg-arctic"
            }`}
          >
            <Icon name="sparkle" className="size-6" />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-small font-bold">{t.baristaWay}</span>
              <span className="text-caption font-medium">{t.baristaSub}</span>
            </span>
            <span
              aria-hidden="true"
              className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-navy transition-colors duration-200 ${baristaOn ? "bg-navy text-yellow" : ""}`}
            >
              <Swap value={baristaOn} className={`transition-[opacity,transform] duration-150 ease-out ${baristaOn ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}>
                <Icon name="check" className="size-4" />
              </Swap>
            </span>
          </ToggleButton>
        </div>
      )}

      {product.addOns.length > 0 && (
        <CheckboxGroup aria-label={t.addOns} value={selectedIds} onChange={selectAddOns}>
          <h3 className="px-4 pb-2 text-body font-bold">{t.addOns}</h3>
          {product.addOns.map((addOn) => (
            <Checkbox
              key={addOn.id}
              value={addOn.id}
              className="flex h-14 w-full items-center gap-4 border-b border-mist px-4 text-start transition-colors duration-150 data-pressed:bg-mist"
            >
              {({ isSelected }) => (
                <>
                  <span
                    aria-hidden="true"
                    className={`flex size-6 shrink-0 items-center justify-center rounded-sm border-2 border-navy transition-colors duration-150 ${isSelected ? "bg-yellow" : ""}`}
                  >
                    <Swap value={isSelected} className={`transition-[opacity,transform] duration-150 ease-out ${isSelected ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}>
                      <Icon name="check" className="size-4" />
                    </Swap>
                  </span>
                  <span className={`flex-1 text-body ${isSelected ? "font-semibold" : "font-medium"}`}>{addOn.name[locale]}</span>
                  <span className="min-w-20 text-end">
                    <Price value={addOn.price} plus size="small" />
                  </span>
                </>
              )}
            </Checkbox>
          ))}
        </CheckboxGroup>
      )}
    </section>
  );
}

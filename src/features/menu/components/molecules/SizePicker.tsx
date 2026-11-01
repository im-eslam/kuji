import type { CSSProperties } from "react";
import { Radio, RadioGroup } from "react-aria-components";
import { useStrings } from "@/shared/i18n";
import { strings } from "../../strings";

interface SizeOption {
  id: string;
  label: string;
}

interface Props {
  sizes: SizeOption[];
  value: string | undefined;
  onChange: (id: string) => void;
}

// The navy thumb slides to the chosen option. A react-aria RadioGroup underneath for correct semantics.
export function SizePicker({ sizes, value, onChange }: Props) {
  const t = useStrings(strings);
  const index = Math.max(0, sizes.findIndex((s) => s.id === value));
  return (
    <div className="flex flex-col gap-2 px-4">
      <span className="text-body font-bold">{t.size}</span>
      <RadioGroup aria-label={t.size} value={value} onChange={onChange} orientation="horizontal">
        <div
          className="relative grid h-12 grid-flow-col auto-cols-fr gap-1 rounded-full bg-mist p-1"
          style={{ "--n": sizes.length } as CSSProperties}
        >
          <span
            aria-hidden="true"
            className="absolute inset-y-1 rounded-full bg-navy transition-transform duration-220 ease-[var(--ease-smooth)]"
            style={{ width: `calc((100% - 0.25rem * (var(--n) - 1)) / var(--n))`, transform: `translateX(calc(${index} * (100% + 0.25rem)))` }}
          />
          {sizes.map((s) => (
            <Radio
              key={s.id}
              value={s.id}
              className="relative flex items-center justify-center whitespace-nowrap rounded-full px-2 text-center text-small font-medium text-navy/65 outline-none transition-colors duration-220 ease-[var(--ease-smooth)] data-selected:font-semibold data-selected:text-white"
            >
              {s.label}
            </Radio>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
}

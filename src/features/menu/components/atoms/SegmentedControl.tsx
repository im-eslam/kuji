import type { CSSProperties } from "react";
import { Radio, RadioGroup } from "react-aria-components";

interface Props {
  label: string;
  options: Array<{ id: string; label: string }>;
  value: string | undefined;
  onChange: (id: string) => void;
}

const styles = {
  group: "relative grid h-12 auto-cols-fr grid-flow-col gap-1 rounded-full bg-mist p-1",
  radio: "relative flex items-center justify-center whitespace-nowrap rounded-full px-2 text-center text-small font-medium text-navy/65 outline-none transition-colors duration-220 ease-[var(--ease-smooth)] data-selected:font-semibold data-selected:text-white",
  thumb: "absolute inset-y-1 rounded-full bg-navy transition-transform duration-220 ease-[var(--ease-smooth)]",
};

export function SegmentedControl({ label, options, value, onChange }: Props) {
  const index = Math.max(0, options.findIndex((option) => option.id === value));
  return (
    <RadioGroup aria-label={label} value={value} onChange={onChange} orientation="horizontal">
      <div className={styles.group} style={{ "--n": options.length } as CSSProperties}>
        <span aria-hidden="true" className={styles.thumb} style={{ width: `calc((100% - 0.25rem * (var(--n) - 1)) / var(--n))`, transform: `translateX(calc(${index} * (100% + 0.25rem)))` }} />
        {options.map((option) => (
          <Radio key={option.id} value={option.id} className={styles.radio}>
            {option.label}
          </Radio>
        ))}
      </div>
    </RadioGroup>
  );
}

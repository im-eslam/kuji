import { Button } from "react-aria-components";
import { useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import { strings } from "../../strings";
import { Rolling } from "./Rolling";
import { Swap } from "./Swap";

interface Props {
  value: number;
  min: number;
  max: number;
  title: string;
  onChange: (next: number) => void;
  /** Order sheet: at the minimum, the minus becomes a trash icon and calls onRemove. */
  onRemove?: () => void;
  /** md: 48px. lg: 56px, level with the primary button in a sheet footer. sm: 36px, still a 48px tap target. */
  size?: "sm" | "md" | "lg";
}

const SIZE = {
  sm: { box: "h-9", btn: "relative h-9 w-10 after:absolute after:inset-x-0 after:-inset-y-1.5", count: "min-w-5", icon: "size-4" },
  md: { box: "h-12", btn: "h-12 w-12", count: "min-w-6", icon: "size-5" },
  lg: { box: "h-14", btn: "h-14 w-10 xs:w-11", count: "min-w-5 xs:min-w-6", icon: "size-5" },
} as const;

export function Stepper({ value, min, max, title, onChange, onRemove, size = "md" }: Props) {
  const t = useStrings(strings);
  const trash = !!onRemove && value <= min;
  const decDisabled = !trash && value <= min;
  const incDisabled = value >= max;
  const s = SIZE[size];
  const btn = `flex items-center justify-center transition-transform duration-150 ease-out data-pressed:scale-90 data-disabled:opacity-40 ${s.btn}`;

  return (
    <div role="group" aria-label={title} className={`box-content flex shrink-0 items-center rounded-full border border-arctic ${s.box}`}>
      <Button
        className={`${btn} rounded-s-full`}
        isDisabled={decDisabled}
        aria-label={trash ? t.a11yRemove(title) : t.a11yDecrease(title)}
        onPress={() => (trash ? onRemove?.() : onChange(value - 1))}
      >
        <Swap value={trash}>
          <Icon name={trash ? "trash" : "minus"} className={s.icon} />
        </Swap>
      </Button>
      <span aria-live="polite" aria-atomic="true" className={`text-center text-body font-bold ${s.count}`}>
        <Rolling text={String(value)} />
      </span>
      <Button className={`${btn} rounded-e-full`} isDisabled={incDisabled} aria-label={t.a11yIncrease(title)} onPress={() => onChange(value + 1)}>
        <Icon name="plus" className={s.icon} />
      </Button>
    </div>
  );
}

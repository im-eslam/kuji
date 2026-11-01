import { useMoney } from "../../lib/money";
import { PrimaryButton } from "../atoms/PrimaryButton";
import { Rolling } from "../atoms/Rolling";
import { Stepper } from "../atoms/Stepper";

interface Props {
  /** Names the quantity control for screen readers. */
  title: string;
  qty: number;
  max: number;
  onQty: (n: number) => void;
  label: string;
  total: number;
  onSubmit: () => void;
}

// The sheet footer: quantity and the primary action in one row. The total lives in the button.
export function AddToOrderBar({ title, qty, max, onQty, label, total, onSubmit }: Props) {
  const money = useMoney();
  return (
    <div className="flex items-center gap-2 xs:gap-3">
      <Stepper size="lg" value={qty} min={1} max={max} title={title} onChange={onQty} />
      <PrimaryButton compact onPress={onSubmit} className="min-w-0 flex-1 gap-1.5 whitespace-nowrap">
        <span>{label}</span>
        <span aria-hidden="true">·</span>
        <Rolling text={money(total)} />
      </PrimaryButton>
    </div>
  );
}

import { Checkbox } from "react-aria-components";
import { Icon } from "@/shared/icons";
import { Price } from "./Price";
import { Swap } from "./Swap";

interface Props {
  value: string;
  label: string;
  price: number;
}

// Used inside a react-aria CheckboxGroup, which owns the selection state.
export function CheckboxRow({ value, label, price }: Props) {
  return (
    <Checkbox
      value={value}
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
          <span className={`flex-1 text-body ${isSelected ? "font-semibold" : "font-medium"}`}>{label}</span>
          <span className="min-w-20 text-end">
            <Price value={price} plus size="small" />
          </span>
        </>
      )}
    </Checkbox>
  );
}

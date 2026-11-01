import { ToggleButton } from "react-aria-components";
import { useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import { strings } from "../../strings";
import { Swap } from "../atoms/Swap";

interface Props {
  isOn: boolean;
  onChange: (on: boolean) => void;
}

export function BaristaWayToggle({ isOn, onChange }: Props) {
  const t = useStrings(strings);
  return (
    <ToggleButton
      isSelected={isOn}
      onChange={onChange}
      className={`flex h-14 w-full items-center gap-3 rounded-lg px-4 text-start transition-[background-color,box-shadow] duration-200 ease-out ${
        isOn ? "bg-yellow ring-2 ring-inset ring-navy" : "bg-arctic"
      }`}
    >
      <Icon name="sparkle" className="size-6" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-small font-bold">{t.baristaWay}</span>
        <span className="text-caption font-medium">{t.baristaSub}</span>
      </span>
      <span
        aria-hidden="true"
        className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-navy transition-colors duration-200 ${isOn ? "bg-navy text-yellow" : ""}`}
      >
        <Swap value={isOn} className={`transition-[opacity,transform] duration-150 ease-out ${isOn ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}>
          <Icon name="check" className="size-4" />
        </Swap>
      </span>
    </ToggleButton>
  );
}

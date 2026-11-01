import { CheckboxGroup } from "react-aria-components";
import { useStrings } from "@/shared/i18n";
import { strings } from "../../strings";
import type { AddOn } from "../../types";
import { CheckboxRow } from "../atoms/CheckboxRow";

interface Props {
  addOns: AddOn[];
  selected: string[];
  onChange: (ids: string[]) => void;
  pick: (name: AddOn["name"]) => string;
}

export function AddOnList({ addOns, selected, onChange, pick }: Props) {
  const t = useStrings(strings);
  return (
    <CheckboxGroup aria-label={t.addOns} value={selected} onChange={onChange}>
      <h3 className="px-4 pb-2 text-body font-bold">{t.addOns}</h3>
      {addOns.map((a) => (
        <CheckboxRow key={a.id} value={a.id} label={pick(a.name)} price={a.price} />
      ))}
    </CheckboxGroup>
  );
}

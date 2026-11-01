import { Button } from "react-aria-components";

interface Props {
  id: string;
  label: string;
  active: boolean;
  onPress: () => void;
}

// The yellow highlight is drawn by the rail (it slides between pills), so the pill itself only changes text.
// The label is stacked twice (bold copy invisible) so the pill keeps one width and neighbours never shift when it activates.
export function CategoryPill({ id, label, active, onPress }: Props) {
  return (
    <Button
      data-pill-id={id}
      aria-current={active ? "true" : undefined}
      onPress={onPress}
      className="relative z-10 flex h-12 shrink-0 items-center"
    >
      <span className="grid h-10 place-items-center whitespace-nowrap rounded-full px-4 text-small transition-transform duration-150 ease-out data-pressed:scale-95">
        <span aria-hidden="true" className="invisible col-start-1 row-start-1 font-semibold">
          {label}
        </span>
        <span className={`col-start-1 row-start-1 transition-colors duration-250 ease-[var(--ease-smooth)] ${active ? "font-semibold text-navy" : "font-medium text-navy/65"}`}>
          {label}
        </span>
      </span>
    </Button>
  );
}

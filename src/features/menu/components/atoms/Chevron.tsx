import { Icon } from "@/shared/icons";

interface Props {
  small?: boolean;
  compact?: boolean;
}

// "Open" affordance: navy arrow on a yellow circle. Static on purpose: the card around it already answers a press.
export function Chevron({ small, compact }: Props) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-yellow text-navy ${small ? "size-6" : compact ? "size-7" : "size-8"}`}
    >
      <Icon name="arrow" className={small ? "size-3" : "size-4"} />
    </span>
  );
}

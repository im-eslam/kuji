import type { ReactNode } from "react";
import { Button } from "react-aria-components";

interface Props {
  children: ReactNode;
  onPress: () => void;
  short?: boolean;
  /** Sits in a row next to another control: less side padding. */
  compact?: boolean;
  className?: string;
}

export function PrimaryButton({ children, onPress, short, compact, className = "" }: Props) {
  return (
    <Button
      onPress={onPress}
      className={`flex w-full items-center justify-center rounded-full bg-yellow text-center font-bold text-navy transition-transform duration-150 ease-out data-pressed:scale-[0.98] ${
        compact ? "px-3 text-body xs:text-heading" : "px-4 text-heading"
      } ${short ? "h-12" : "h-14"} ${className}`}
    >
      {children}
    </Button>
  );
}

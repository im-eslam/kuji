import type { ReactNode } from "react";
import { Button } from "react-aria-components";

interface Props {
  children: ReactNode;
  onPress: () => void;
  className?: string;
}

export function ConfirmButton({ children, onPress, className = "" }: Props) {
  return (
    <Button
      onPress={onPress}
      className={`flex h-12 items-center justify-center rounded-full bg-navy px-4 text-center text-small font-semibold text-white transition-transform duration-150 ease-out data-pressed:scale-[0.98] ${className}`}
    >
      {children}
    </Button>
  );
}

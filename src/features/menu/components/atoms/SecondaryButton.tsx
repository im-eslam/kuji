import type { ReactNode } from "react";
import { Button } from "react-aria-components";

interface Props {
  children: ReactNode;
  onPress: () => void;
  className?: string;
}

export function SecondaryButton({ children, onPress, className = "" }: Props) {
  return (
    <Button
      onPress={onPress}
      className={`flex h-12 items-center justify-center gap-2 rounded-full border border-arctic px-4 text-center text-small font-semibold data-pressed:bg-mist ${className}`}
    >
      {children}
    </Button>
  );
}

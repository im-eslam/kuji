import { useState, type ReactNode } from "react";

interface Props {
  value: string | number | boolean | null | undefined;
  children: ReactNode;
  className?: string;
}

// For things that get replaced, not counted: an icon turning into another (plus -> check, minus -> bin).
// The new one pops in; nothing plays on first render, and the same value stays still.
export function Swap({ value, children, className = "" }: Props) {
  const key = String(value);
  const [prev, setPrev] = useState(key);
  const [changed, setChanged] = useState(false);
  if (prev !== key) {
    setPrev(key);
    setChanged(true);
  }
  return (
    <span key={key} className={`inline-flex ${changed ? "animate-pop-in" : ""} ${className}`}>
      {children}
    </span>
  );
}

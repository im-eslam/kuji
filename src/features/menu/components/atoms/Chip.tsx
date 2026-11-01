import type { ReactNode } from "react";

interface Props {
  kind?: "detail" | "savings";
  compact?: boolean;
  outlined?: boolean;
  children: ReactNode;
}

const styles = {
  base: "inline-flex max-w-full items-center rounded-full px-2 text-caption tabular-nums text-balance",
};

// One line is exactly 24px (20 compact); a label that must wrap grows the chip instead of spilling out or truncating.
export function Chip({ kind = "detail", compact, outlined, children }: Props) {
  return (
    <span
      className={`${styles.base} ${outlined ? "ring-1 ring-white" : ""} ${compact ? "min-h-5 py-0.5" : "min-h-6 py-1"} ${
        kind === "detail" ? "bg-mist font-medium" : "bg-arctic font-semibold"
      }`}
    >
      {children}
    </span>
  );
}

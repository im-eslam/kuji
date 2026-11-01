import type { ReactNode } from "react";

// The sheet's in-content heading. The enclosing BottomSheet locates it (via data-sheet-title) to fade its own
// top bar in as this heading scrolls up and away, so the title seems to travel into the bar.
export function SheetTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h2 data-sheet-title className={`text-title font-bold ${className}`}>
      {children}
    </h2>
  );
}

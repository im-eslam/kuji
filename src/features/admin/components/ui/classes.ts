export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

// Light surfaces: a navy ring outside the control.
export const focusRing =
  "outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-navy";

// Navy-filled controls: the ring is drawn inside the fill, so yellow stays visible
// whatever sits behind (the global currentColor ring is invisible on navy).
export const focusRingOnDark =
  "outline-none data-focus-visible:outline-2 data-focus-visible:-outline-offset-4 data-focus-visible:outline-yellow";

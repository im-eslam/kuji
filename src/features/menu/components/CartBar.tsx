import { useEffect, useRef, useState } from "react";
import { useStrings } from "@/shared/i18n";
import { strings, useMoney } from "../localization/strings";
import { Rolling } from "./ui";

interface Props {
  count: number;
  subtotal: number;
  /** True while a sheet or search is open. The bar is hidden behind it, so it waits to show what changed. */
  sheetOpen: boolean;
  onOpen: () => void;
}

/** A quick, small "pulse" of the element. */
function pulse(element: Element | null, scale: number, ms: number) {
  if (!element || typeof element.animate !== "function") return;
  element.animate([{ transform: "scale(1)" }, { transform: `scale(${scale})`, offset: 0.4 }, { transform: "scale(1)" }], {
    duration: ms,
    easing: "cubic-bezier(0.16, 1, 0.3, 1)",
  });
}

/** The black bar at the bottom: how many items are in the cart and the subtotal. Tap it to open the cart. */
export function CartBar({ count, subtotal, sheetOpen, onOpen }: Props) {
  const t = useStrings(strings);
  const money = useMoney();
  const price = money(subtotal);

  // `held` is what the bar reflects. While a sheet is open it stays as it was, and catches up once the sheet is gone,
  // which is when the customer can see the bar and the pulse.
  const [held, setHeld] = useState({ count, price });
  if (!sheetOpen && (held.count !== count || held.price !== price)) setHeld({ count, price });

  // When the cart becomes empty the bar slides away; during that slide it keeps showing the last real values instead of "0".
  const [lastFilled, setLastFilled] = useState(held);
  if (held.count > 0 && lastFilled !== held) setLastFilled(held);

  const visible = held.count > 0;
  const shown = visible ? held : lastFilled;

  // Pulse when what the bar shows changes while it is already on screen. Appearing for the first item is the slide-in, not a pulse.
  const bar = useRef<HTMLButtonElement>(null);
  const dot = useRef<HTMLSpanElement>(null);
  const previous = useRef({ visible, count: shown.count, price: shown.price });
  useEffect(() => {
    const before = previous.current;
    previous.current = { visible, count: shown.count, price: shown.price };
    if (!before.visible || !visible) return;
    if (before.count !== shown.count) {
      pulse(dot.current, 1.22, 440);
      pulse(bar.current, 1.035, 400);
    } else if (before.price !== shown.price) {
      pulse(bar.current, 1.02, 340);
    }
  }, [visible, shown.count, shown.price]);

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center transition-[transform,opacity,visibility] ${
        visible ? "visible translate-y-0 opacity-100 duration-250 ease-[var(--ease-smooth)]" : "invisible translate-y-full opacity-0 duration-200 ease-[var(--ease-exit)]"
      }`}
    >
      <div className="w-full max-w-120 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button
          ref={bar}
          type="button"
          tabIndex={visible ? 0 : -1}
          aria-label={t.a11yViewOrder(shown.count, shown.price)}
          onClick={onOpen}
          className="pointer-events-auto flex h-14 w-full items-center gap-3 rounded-full bg-navy px-3 text-white transition-transform duration-150 ease-out active:scale-[0.98]"
        >
          <span ref={dot} className="flex h-8 min-w-8 items-center justify-center rounded-full bg-yellow px-2 text-small font-bold text-navy">
            <Rolling text={String(shown.count)} />
          </span>
          <span className="flex-1 text-start text-body font-bold">{t.viewOrder}</span>
          <span className="pe-2 text-body font-bold">
            <Rolling text={shown.price} />
          </span>
        </button>
      </div>
    </div>
  );
}

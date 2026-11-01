import { useEffect, useRef } from "react";
import { useStrings } from "@/shared/i18n";
import { useMenuState } from "../../hooks/useMenuState";
import { useMoney } from "../../lib/money";
import { bump } from "../../lib/motion";
import { strings } from "../../strings";
import { Rolling } from "../atoms/Rolling";

// ==== Styles ====

const styles = {
  wrap: "pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center transition-[transform,opacity,visibility]",
  visible: "visible translate-y-0 opacity-100 duration-250 ease-[var(--ease-smooth)]",
  hidden: "invisible translate-y-full opacity-0 duration-200 ease-[var(--ease-exit)]",
  inner: "w-full max-w-120 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]",
  bar: "pointer-events-auto flex h-14 w-full items-center gap-3 rounded-full bg-navy px-3 text-white transition-transform duration-150 ease-out active:scale-[0.98]",
  dot: "flex h-8 min-w-8 items-center justify-center rounded-full bg-yellow px-2 text-small font-bold text-navy",
  label: "flex-1 text-start text-body font-bold",
  price: "pe-2 text-body font-bold",
};

// ==== Order bar ====

export function OrderBar() {
  const t = useStrings(strings);
  const money = useMoney();
  const { count, subtotal, overlay, openOrder } = useMenuState();
  const live = { count, price: money(subtotal) };

  // While a sheet is open the bar is hidden behind it, so a change made in the sheet would play unseen. The bar
  // holds what it showed and catches up the moment the sheet is gone: that is when the count rolls and it pulses.
  const held = useRef(live);
  if (overlay.type === "none") held.current = live;
  const visible = held.current.count > 0;

  // While it slides away after the last item is removed, keep showing the last values instead of "0".
  const last = useRef(held.current);
  if (visible) last.current = held.current;
  const shown = last.current;

  // Pulse when what the bar shows changes while it is already on screen. Arriving (first item) is the slide-in, not a pulse.
  const bar = useRef<HTMLButtonElement>(null);
  const dot = useRef<HTMLSpanElement>(null);
  const seen = useRef({ visible, count: shown.count, price: shown.price });
  useEffect(() => {
    const prev = seen.current;
    seen.current = { visible, count: shown.count, price: shown.price };
    if (!prev.visible || !visible) return;
    if (prev.count !== shown.count) {
      bump(dot.current, 1.22, 440);
      bump(bar.current, 1.035, 400);
    } else if (prev.price !== shown.price) {
      bump(bar.current, 1.02, 340);
    }
  }, [visible, shown.count, shown.price]);

  return (
    <div className={`${styles.wrap} ${visible ? styles.visible : styles.hidden}`}>
      <div className={styles.inner}>
        <button
          ref={bar}
          type="button"
          tabIndex={visible ? 0 : -1}
          aria-label={t.a11yViewOrder(shown.count, shown.price)}
          onClick={openOrder}
          className={styles.bar}
        >
          <span ref={dot} className={styles.dot}>
            <Rolling text={String(shown.count)} />
          </span>
          <span className={styles.label}>{t.viewOrder}</span>
          <span className={styles.price}>
            <Rolling text={shown.price} />
          </span>
        </button>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { Button } from "react-aria-components";
import { useStrings } from "@/shared/i18n";
import { strings, useMoney } from "../../localization/strings";
import { cx, Rolling } from "../shared/ui";

interface Props {
  count: number;
  subtotal: number;
  sheetOpen: boolean;
  onOpen: () => void;
}

const styles = {
  wrapper: "pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center transition-[transform,opacity,visibility]",
  wrapperShown: "visible translate-y-0 opacity-100 duration-250 ease-[var(--ease-smooth)]",
  wrapperHidden: "invisible translate-y-full opacity-0 duration-200 ease-[var(--ease-exit)]",
  inner: "w-full max-w-120 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]",
  bar: cx(
    "pointer-events-auto flex h-14 w-full items-center gap-3 rounded-full bg-navy px-3 text-white shadow-sheet transition-transform duration-150 ease-out data-pressed:scale-[0.98]",
    "outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-yellow",
  ),
  count: "flex h-8 min-w-8 items-center justify-center rounded-full bg-yellow px-2 text-small font-bold text-navy",
  label: "min-w-0 flex-1 truncate text-start text-body font-bold",
  price: "pe-2 text-body font-bold",
};

function pulse(element: Element | null, scale: number, ms: number) {
  if (!element || typeof element.animate !== "function") return;
  element.animate([{ transform: "scale(1)" }, { transform: `scale(${scale})`, offset: 0.4 }, { transform: "scale(1)" }], {
    duration: ms,
    easing: "cubic-bezier(0.16, 1, 0.3, 1)",
  });
}

export function CartBar({ count, subtotal, sheetOpen, onOpen }: Props) {
  const t = useStrings(strings);
  const money = useMoney();
  const price = money(subtotal);

  const [held, setHeld] = useState({ count, price });
  if (!sheetOpen && (held.count !== count || held.price !== price)) setHeld({ count, price });

  const [lastFilled, setLastFilled] = useState(held);
  if (held.count > 0 && lastFilled !== held) setLastFilled(held);

  const visible = held.count > 0;
  const shown = visible ? held : lastFilled;

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
    <div inert={!visible} className={cx(styles.wrapper, visible ? styles.wrapperShown : styles.wrapperHidden)}>
      <div className={styles.inner}>
        <Button ref={bar} aria-label={t.a11yViewOrder(shown.count, shown.price)} onPress={onOpen} className={styles.bar}>
          <span ref={dot} className={styles.count}>
            <Rolling text={String(shown.count)} />
          </span>
          <span className={styles.label}>{t.viewOrder}</span>
          <span className={styles.price}>
            <Rolling text={shown.price} />
          </span>
        </Button>
      </div>
    </div>
  );
}

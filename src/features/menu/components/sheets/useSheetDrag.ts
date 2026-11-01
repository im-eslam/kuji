import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";

const DISMISS_DISTANCE = 150;
const FLICK_DISTANCE = 60;
const FLICK_SPEED = 0.6;

export function useSheetDrag(onDismiss: () => void) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ y: number; time: number } | null>(null);

  const reset = useCallback(() => setOffset(0), []);

  function finish(event: PointerEvent<HTMLElement>, cancelled: boolean) {
    if (!start.current) return;
    const distance = event.clientY - start.current.y;
    const speed =
      distance / Math.max(1, performance.now() - start.current.time);
    start.current = null;
    setDragging(false);

    const flicked = distance > FLICK_DISTANCE && speed > FLICK_SPEED;
    if (!cancelled && (distance > DISMISS_DISTANCE || flicked)) onDismiss();
    else setOffset(0);
  }

  const handleProps = {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      start.current = { y: event.clientY, time: performance.now() };
      setDragging(true);
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (start.current)
        setOffset(Math.max(0, event.clientY - start.current.y));
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => finish(event, false),
    onPointerCancel: (event: PointerEvent<HTMLElement>) => finish(event, true),
  };

  const style: CSSProperties | undefined =
    offset > 0
      ? ({
          transform: `translateY(${offset}px)`,
          "--sheet-drag": `${offset}px`,
        } as CSSProperties)
      : undefined;

  return { handleProps, style, dragging, reset };
}

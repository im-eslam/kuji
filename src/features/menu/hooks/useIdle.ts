import { useEffect, useState } from "react";

type IdleWindow = typeof window & {
  requestIdleCallback?: (cb: () => void) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export function useIdle(): boolean {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    const w = window as IdleWindow;
    if (w.requestIdleCallback) {
      const handle = w.requestIdleCallback(() => setIdle(true));
      return () => w.cancelIdleCallback?.(handle);
    }
    const timer = window.setTimeout(() => setIdle(true), 200);
    return () => window.clearTimeout(timer);
  }, []);
  return idle;
}

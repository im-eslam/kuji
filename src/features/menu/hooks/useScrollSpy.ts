import { useCallback, useEffect, useRef, useState } from "react";

export function useScrollSpy(ids: string[]) {
  const [activeId, setActiveId] = useState(ids[0] ?? "");
  const elements = useRef(new Map<string, HTMLElement>());
  const ratios = useRef(new Map<string, number>());
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.sectionId;
          if (id) ratios.current.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        let best: string | null = null;
        let bestRatio = 0;
        for (const id of ids) {
          const ratio = ratios.current.get(id) ?? 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = id;
          }
        }
        if (best) setActiveId(best);
      },
      { rootMargin: "-112px 0px -65% 0px", threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    );
    elements.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  const register = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      const prev = [...elements.current.entries()].find(([, node]) => node === el);
      if (prev) elements.current.delete(prev[0]);
      if (el) {
        el.dataset.sectionId = id;
        elements.current.set(id, el);
      }
    },
    [],
  );

  const scrollTo = useCallback((id: string) => {
    const el = elements.current.get(id);
    if (el) {
      setActiveId(id);
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return { activeId, register, scrollTo };
}

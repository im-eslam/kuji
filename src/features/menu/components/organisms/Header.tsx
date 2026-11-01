import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocale, useStrings } from "@/shared/i18n";
import { strings } from "../../strings";
import { CategoryPill } from "../atoms/CategoryPill";
import { EdgeFade } from "../atoms/EdgeFade";
import { IconButton } from "../atoms/IconButton";
import { LanguagePill } from "../atoms/LanguagePill";
import { Logo } from "../atoms/Logo";

interface Pill {
  id: string;
  label: string;
}

interface Props {
  pills: Pill[];
  activeId: string;
  onPill: (id: string) => void;
  onSearch: () => void;
  onCategories: () => void;
}

export function Header({ pills, activeId, onPill, onSearch, onCategories }: Props) {
  const t = useStrings(strings);
  const locale = useLocale();
  const rail = useRef<HTMLDivElement>(null);
  const centered = useRef(false);
  const [thumb, setThumb] = useState<{ x: number; w: number } | null>(null);
  const [animated, setAnimated] = useState(false);
  const [moreAhead, setMoreAhead] = useState(true);

  const pillOf = (id: string) => rail.current?.querySelector<HTMLElement>(`[data-pill-id="${id}"]`) ?? null;

  const measure = useCallback(() => {
    const pill = pillOf(activeId);
    if (pill) setThumb({ x: pill.offsetLeft, w: pill.offsetWidth });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useLayoutEffect(measure, [measure, locale]);

  useEffect(() => {
    const r = rail.current;
    if (!r) return;
    const ro = new ResizeObserver(measure);
    ro.observe(r);
    r.querySelectorAll("button").forEach((b) => ro.observe(b));
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [measure, locale]);

  useEffect(() => {
    if (thumb && !animated) {
      const id = requestAnimationFrame(() => setAnimated(true));
      return () => cancelAnimationFrame(id);
    }
  }, [thumb, animated]);

  useEffect(() => {
    const r = rail.current;
    const pill = pillOf(activeId);
    if (!r || !pill) return;
    const rr = r.getBoundingClientRect();
    const pr = pill.getBoundingClientRect();
    const delta = pr.left + pr.width / 2 - (rr.left + rr.width / 2);
    r.scrollBy({ left: delta, behavior: centered.current ? "smooth" : "auto" });
    centered.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, locale]);

  const onRailScroll = () => {
    const r = rail.current;
    if (r) setMoreAhead(Math.abs(r.scrollLeft) + r.clientWidth < r.scrollWidth - 4);
  };
  useEffect(onRailScroll, [locale]);

  return (
    <header className="sticky top-0 z-30 border-b border-mist bg-white">
      <div className="flex h-14 items-center gap-1 ps-4 pe-2">
        <Logo />
        <div className="flex-1" />
        <IconButton icon="search" label={t.a11ySearch} onPress={onSearch} />
        <LanguagePill />
      </div>
      <div className="flex h-12 items-center">
        <div className="shrink-0 ps-1">
          <IconButton icon="menu" label={t.a11yCategories} onPress={onCategories} />
        </div>
        <nav aria-label={t.categoriesTitle} className="relative h-12 min-w-0 flex-1">
          <div ref={rail} onScroll={onRailScroll} className="no-scrollbar relative flex h-12 items-center gap-1 overflow-x-auto overscroll-x-contain ps-4 pe-4">
            <span
              aria-hidden="true"
              className={`absolute top-1 left-0 h-10 rounded-full bg-yellow ${animated ? "transition-[transform,width] duration-250 ease-[var(--ease-smooth)]" : ""}`}
              style={{ width: thumb?.w ?? 0, transform: `translateX(${thumb?.x ?? 0}px)`, opacity: thumb ? 1 : 0 }}
            />
            {pills.map((p) => (
              <CategoryPill key={p.id} id={p.id} label={p.label} active={p.id === activeId} onPress={() => onPill(p.id)} />
            ))}
          </div>
          <EdgeFade edge="start" />
          <EdgeFade edge="end" visible={moreAhead} />
        </nav>
      </div>
    </header>
  );
}

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "react-aria-components";
import avatar from "@/assets/avatar.jpg";
import wordmark from "@/assets/wordmark.png";
import { setLocale, useLocale, useStrings } from "@/shared/i18n";
import { Icon, type IconName } from "@/shared/icons";
import { strings } from "../localization/strings";

interface Props {
  /** The page sections, in order: signatures, pairings, then every category. */
  sections: { id: string; label: string }[];
  activeId: string;
  onSelect: (id: string) => void;
  onSearch: () => void;
  onCategories: () => void;
}

function IconButton({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Button aria-label={label} onPress={onPress} className="flex size-12 shrink-0 items-center justify-center">
      <Icon name={icon} className="size-6" />
    </Button>
  );
}

/** Switches between English and Arabic. `setLocale` also flips the page to right-to-left. */
function LanguageButton() {
  const locale = useLocale();
  const t = useStrings(strings);
  return (
    <Button aria-label={t.a11yLanguage} onPress={() => setLocale(locale === "en" ? "ar" : "en")} className="flex h-12 shrink-0 items-center">
      <span dir="ltr" className="flex h-10 items-center gap-1 rounded-full border border-arctic px-3 text-small">
        <span lang="en" className={locale === "en" ? "font-bold" : "font-medium text-navy/65"}>
          EN
        </span>
        <span aria-hidden="true" className="text-navy/65">
          |
        </span>
        <span lang="ar" className={locale === "ar" ? "font-bold" : "font-medium text-navy/65"}>
          ع
        </span>
      </span>
    </Button>
  );
}

/** A small white-to-transparent fade over one end of the scrolling pills. "start" is the leading edge in either direction. */
function EdgeFade({ edge, visible = true }: { edge: "start" | "end"; visible?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-y-0 w-4 from-white to-transparent transition-opacity duration-200 ${
        edge === "start" ? "start-0 bg-linear-to-r rtl:bg-linear-to-l" : "end-0 bg-linear-to-l rtl:bg-linear-to-r"
      } ${visible ? "opacity-100" : "opacity-0"}`}
    />
  );
}

/** Finds the pill button of one section inside the scrolling row. */
function findPill(rail: HTMLElement | null, id: string) {
  return rail?.querySelector<HTMLElement>(`[data-pill-id="${id}"]`) ?? null;
}

export function Header({ sections, activeId, onSelect, onSearch, onCategories }: Props) {
  const t = useStrings(strings);
  const locale = useLocale();
  const rail = useRef<HTMLDivElement>(null);
  const railHasBeenCentered = useRef(false);
  const [highlight, setHighlight] = useState<{ x: number; width: number } | null>(null);
  const [highlightCanSlide, setHighlightCanSlide] = useState(false);
  const [moreAhead, setMoreAhead] = useState(true);

  // The yellow highlight is one element that slides under the active pill.
  const measureHighlight = useCallback(() => {
    const pill = findPill(rail.current, activeId);
    if (pill) setHighlight({ x: pill.offsetLeft, width: pill.offsetWidth });
  }, [activeId]);

  // Pill widths change with the language, so measure again when it changes.
  useLayoutEffect(measureHighlight, [measureHighlight, locale]);

  // Pills also change width when the font finishes loading or the window resizes.
  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    const observer = new ResizeObserver(measureHighlight);
    observer.observe(element);
    element.querySelectorAll("button").forEach((pill) => observer.observe(pill));
    document.fonts?.ready.then(measureHighlight);
    return () => observer.disconnect();
  }, [measureHighlight, locale]);

  // Slide the highlight only after its first placement, so it does not fly in from the corner on load.
  useEffect(() => {
    if (!highlight || highlightCanSlide) return;
    const frame = requestAnimationFrame(() => setHighlightCanSlide(true));
    return () => cancelAnimationFrame(frame);
  }, [highlight, highlightCanSlide]);

  // Keep the active pill in the middle of the row.
  useEffect(() => {
    const element = rail.current;
    const pill = findPill(element, activeId);
    if (!element || !pill) return;
    const railBox = element.getBoundingClientRect();
    const pillBox = pill.getBoundingClientRect();
    const offset = pillBox.left + pillBox.width / 2 - (railBox.left + railBox.width / 2);
    element.scrollBy({ left: offset, behavior: railHasBeenCentered.current ? "smooth" : "auto" });
    railHasBeenCentered.current = true;
  }, [activeId, locale]);

  // The fade at the far end of the row only shows while there are more pills to scroll to.
  function updateMoreAhead() {
    const element = rail.current;
    if (element) setMoreAhead(Math.abs(element.scrollLeft) + element.clientWidth < element.scrollWidth - 4);
  }
  useEffect(updateMoreAhead, [locale]);

  return (
    <header className="sticky top-0 z-30 border-b border-mist bg-white">
      <div className="flex h-14 items-center gap-1 ps-4 pe-2">
        <div className="flex items-center gap-2">
          <img src={avatar} alt="" className="size-10 rounded-full object-cover" />
          <img src={wordmark} alt="Kuji" className="h-6 w-auto" />
        </div>
        <div className="flex-1" />
        <IconButton icon="search" label={t.a11ySearch} onPress={onSearch} />
        <LanguageButton />
      </div>

      <div className="flex h-12 items-center">
        <div className="shrink-0 ps-1">
          <IconButton icon="menu" label={t.a11yCategories} onPress={onCategories} />
        </div>
        <nav aria-label={t.categoriesTitle} className="relative h-12 min-w-0 flex-1">
          <div ref={rail} onScroll={updateMoreAhead} className="no-scrollbar relative flex h-12 items-center gap-1 overflow-x-auto overscroll-x-contain ps-4 pe-4">
            <span
              aria-hidden="true"
              className={`absolute top-1 left-0 h-10 rounded-full bg-yellow ${highlightCanSlide ? "transition-[transform,width] duration-250 ease-[var(--ease-smooth)]" : ""}`}
              style={{ width: highlight?.width ?? 0, transform: `translateX(${highlight?.x ?? 0}px)`, opacity: highlight ? 1 : 0 }}
            />
            {sections.map((section) => (
              <Button
                key={section.id}
                data-pill-id={section.id}
                aria-current={section.id === activeId ? "true" : undefined}
                onPress={() => onSelect(section.id)}
                className="relative z-10 flex h-12 shrink-0 items-center"
              >
                {/* The label is drawn twice (an invisible bold copy) so the pill keeps one width and its neighbours never shift when it becomes active. */}
                <span className="grid h-10 place-items-center whitespace-nowrap rounded-full px-4 text-small transition-transform duration-150 ease-out data-pressed:scale-95">
                  <span aria-hidden="true" className="invisible col-start-1 row-start-1 font-semibold">
                    {section.label}
                  </span>
                  <span
                    className={`col-start-1 row-start-1 transition-colors duration-250 ease-[var(--ease-smooth)] ${
                      section.id === activeId ? "font-semibold text-navy" : "font-medium text-navy/65"
                    }`}
                  >
                    {section.label}
                  </span>
                </span>
              </Button>
            ))}
          </div>
          <EdgeFade edge="start" />
          <EdgeFade edge="end" visible={moreAhead} />
        </nav>
      </div>
    </header>
  );
}

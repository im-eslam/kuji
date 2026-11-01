import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Button } from "react-aria-components";
import avatar from "@/assets/avatar.jpg";
import wordmark from "@/assets/wordmark.png";
import { setLocale, useLocale, useStrings } from "@/shared/i18n";
import { Icon, type IconName } from "@/shared/icons";
import { strings } from "../../localization/strings";
import { cx, focusRing, pageWidth } from "../shared/ui";

interface Props {
  sections: { id: string; label: string }[];
  activeId: string;
  onSelect: (id: string) => void;
  onSearch: () => void;
  onCategories: () => void;
}

const styles = {
  header: "sticky top-0 z-30 border-b border-mist bg-white",
  topRow: cx(
    pageWidth,
    "flex h-14 items-center gap-1 ps-4 pe-2 md:ps-6 md:pe-4",
  ),
  brand: "flex min-w-0 items-center gap-2",
  avatar: "size-10 shrink-0 rounded-full object-cover",
  wordmark: "h-6 w-auto",
  spacer: "flex-1",
  pillRow: cx(pageWidth, "flex h-12 items-center"),
  menuSlot: "shrink-0 ps-1 md:ps-3",
  nav: "relative h-12 min-w-0 flex-1",
  rail: "no-scrollbar relative flex h-12 items-center gap-1 overflow-x-auto overscroll-x-contain px-4",
  highlight: "absolute top-1 left-0 h-10 rounded-full bg-yellow",
  highlightSlides:
    "transition-[transform,width] duration-250 ease-[var(--ease-smooth)]",
  pill: cx(
    "group relative z-10 flex h-12 shrink-0 items-center rounded-full",
    focusRing,
  ),
  pillBody:
    "grid h-10 place-items-center whitespace-nowrap rounded-full px-4 text-small transition-transform duration-150 ease-out group-data-pressed:scale-95",
  pillSizer: "invisible col-start-1 row-start-1 font-semibold",
  pillLabel:
    "col-start-1 row-start-1 transition-colors duration-250 ease-[var(--ease-smooth)]",
  pillLabelActive: "font-semibold text-navy",
  pillLabelIdle: "font-medium text-navy/65",
  fade: "pointer-events-none absolute inset-y-0 w-4 from-white to-transparent transition-opacity duration-200",
  fadeStart: "start-0 bg-linear-to-r rtl:bg-linear-to-l",
  fadeEnd: "end-0 bg-linear-to-l rtl:bg-linear-to-r",
  iconButton: cx(
    "flex size-12 shrink-0 items-center justify-center rounded-full data-hovered:bg-mist data-pressed:bg-mist",
    focusRing,
  ),
  icon: "size-6",
  language: cx("flex h-12 shrink-0 items-center rounded-full", focusRing),
  languageBody:
    "flex h-10 items-center gap-1 rounded-full border border-arctic px-3 text-small",
  languageOn: "font-bold",
  languageOff: "font-medium text-navy/65",
  languageDivider: "text-navy/65",
};

function IconButton({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <Button aria-label={label} onPress={onPress} className={styles.iconButton}>
      <Icon name={icon} className={styles.icon} />
    </Button>
  );
}

function LanguageButton() {
  const locale = useLocale();
  const t = useStrings(strings);
  return (
    <Button
      aria-label={t.a11yLanguage}
      onPress={() => setLocale(locale === "en" ? "ar" : "en")}
      className={styles.language}
    >
      <span dir="ltr" className={styles.languageBody}>
        <span
          lang="en"
          className={locale === "en" ? styles.languageOn : styles.languageOff}
        >
          EN
        </span>
        <span aria-hidden="true" className={styles.languageDivider}>
          |
        </span>
        <span
          lang="ar"
          className={locale === "ar" ? styles.languageOn : styles.languageOff}
        >
          ع
        </span>
      </span>
    </Button>
  );
}

function EdgeFade({
  edge,
  visible = true,
}: {
  edge: "start" | "end";
  visible?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={cx(
        styles.fade,
        edge === "start" ? styles.fadeStart : styles.fadeEnd,
        visible ? "opacity-100" : "opacity-0",
      )}
    />
  );
}

function findPill(rail: HTMLElement | null, id: string) {
  return rail?.querySelector<HTMLElement>(`[data-pill-id="${id}"]`) ?? null;
}

export function Header({
  sections,
  activeId,
  onSelect,
  onSearch,
  onCategories,
}: Props) {
  const t = useStrings(strings);
  const locale = useLocale();
  const rail = useRef<HTMLDivElement>(null);
  const railHasBeenCentered = useRef(false);
  const [highlight, setHighlight] = useState<{
    x: number;
    width: number;
  } | null>(null);
  const [highlightCanSlide, setHighlightCanSlide] = useState(false);
  const [moreAhead, setMoreAhead] = useState(true);

  const measureHighlight = useCallback(() => {
    const pill = findPill(rail.current, activeId);
    if (pill) setHighlight({ x: pill.offsetLeft, width: pill.offsetWidth });
  }, [activeId]);

  useLayoutEffect(measureHighlight, [measureHighlight, locale]);

  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    const observer = new ResizeObserver(measureHighlight);
    observer.observe(element);
    element
      .querySelectorAll("button")
      .forEach((pill) => observer.observe(pill));
    document.fonts?.ready.then(measureHighlight);
    return () => observer.disconnect();
  }, [measureHighlight, locale]);

  useEffect(() => {
    if (!highlight || highlightCanSlide) return;
    const frame = requestAnimationFrame(() => setHighlightCanSlide(true));
    return () => cancelAnimationFrame(frame);
  }, [highlight, highlightCanSlide]);

  useEffect(() => {
    const element = rail.current;
    const pill = findPill(element, activeId);
    if (!element || !pill) return;
    const railBox = element.getBoundingClientRect();
    const pillBox = pill.getBoundingClientRect();
    const offset =
      pillBox.left + pillBox.width / 2 - (railBox.left + railBox.width / 2);
    element.scrollBy({
      left: offset,
      behavior: railHasBeenCentered.current ? "smooth" : "auto",
    });
    railHasBeenCentered.current = true;
  }, [activeId, locale]);

  function updateMoreAhead() {
    const element = rail.current;
    if (element)
      setMoreAhead(
        Math.abs(element.scrollLeft) + element.clientWidth <
          element.scrollWidth - 4,
      );
  }
  useEffect(updateMoreAhead, [locale]);

  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        <div className={styles.brand}>
          <img src={avatar} alt="" className={styles.avatar} />
          <img src={wordmark} alt="Kuji" className={styles.wordmark} />
        </div>
        <div className={styles.spacer} />
        <IconButton icon="search" label={t.a11ySearch} onPress={onSearch} />
        <LanguageButton />
      </div>

      <div className={styles.pillRow}>
        <div className={styles.menuSlot}>
          <IconButton
            icon="menu"
            label={t.a11yCategories}
            onPress={onCategories}
          />
        </div>
        <nav aria-label={t.categoriesTitle} className={styles.nav}>
          <div ref={rail} onScroll={updateMoreAhead} className={styles.rail}>
            <span
              aria-hidden="true"
              className={cx(
                styles.highlight,
                highlightCanSlide && styles.highlightSlides,
              )}
              style={{
                width: highlight?.width ?? 0,
                transform: `translateX(${highlight?.x ?? 0}px)`,
                opacity: highlight ? 1 : 0,
              }}
            />
            {sections.map((section) => {
              const active = section.id === activeId;
              return (
                <Button
                  key={section.id}
                  data-pill-id={section.id}
                  aria-current={active ? "true" : undefined}
                  onPress={() => onSelect(section.id)}
                  className={styles.pill}
                >
                  <span className={styles.pillBody}>
                    <span aria-hidden="true" className={styles.pillSizer}>
                      {section.label}
                    </span>
                    <span
                      className={cx(
                        styles.pillLabel,
                        active ? styles.pillLabelActive : styles.pillLabelIdle,
                      )}
                    >
                      {section.label}
                    </span>
                  </span>
                </Button>
              );
            })}
          </div>
          <EdgeFade edge="start" />
          <EdgeFade edge="end" visible={moreAhead} />
        </nav>
      </div>
    </header>
  );
}

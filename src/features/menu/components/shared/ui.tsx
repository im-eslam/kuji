import { useState, type ReactNode, type Ref } from "react";
import { Button } from "react-aria-components";
import { useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import { strings, useMoney } from "../../localization/strings";

// Small building blocks used by many menu components. Each one only receives props and draws something.
//
//   Helpers:  cx · focusRing · focusRingInset · pageWidth · pagePadding · cardSurface
//   Display:  Img · Badge · Chip · Chevron · SectionHead · SheetTitle
//   Prices:   Price · PriceWithDiscount · Rolling · Swap
//   Controls: PrimaryButton · SecondaryButton · CloseButton · Stepper · AddToCartBar
//
// Every class name below comes from the design tokens the project already uses (navy, mist, arctic, yellow,
// white, scrim, text-caption / small / body / heading / title, rounded-sheet, shadow-sheet ...).

// ==== Shared class names ====

/** Joins class names, skipping anything falsy. Lets a style object stay readable when a class depends on state. */
export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** The keyboard focus ring of every react-aria control. It only shows for keyboard users (data-focus-visible). */
export const focusRing = "outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-navy";

/** Same ring, drawn inside the element. For full-width rows where an outer ring would be clipped. */
export const focusRingInset = "outline-none data-focus-visible:outline-2 data-focus-visible:-outline-offset-2 data-focus-visible:outline-navy";

/** Keeps page content a comfortable width on tablets and desktops. Phones use the full width. */
export const pageWidth = "mx-auto w-full max-w-5xl";

/** Side padding that grows a little on larger screens. */
export const pagePadding = "px-4 md:px-6";

/** The look shared by product, signature and pairing cards. */
export const cardSurface = cx(
  "rounded-lg border border-arctic bg-white text-start transition-[transform,background-color,border-color] duration-150 ease-out",
  "data-hovered:border-navy/30 data-pressed:scale-[0.98] data-pressed:bg-mist",
  focusRing,
);

// ==== Pictures, labels and headings ====

const imgStyles = {
  frame: "relative overflow-hidden bg-mist",
  photo: "absolute inset-0 size-full object-cover transition-opacity duration-200 ease-out",
  shown: "opacity-100",
  hidden: "opacity-0",
};

/** A product's own picture. With no picture (or a broken link) it shows a plain neutral block. Images are never mirrored in RTL. */
export function Img({ image, alt = "", className = "", priority }: {
  image: string | null;
  alt?: string;
  className?: string;
  /** Above the fold: load right away instead of waiting until it is near the screen. */
  priority?: boolean;
}) {
  const [state, setState] = useState<"loading" | "loaded" | "broken">("loading");
  const [shownImage, setShownImage] = useState(image);
  if (shownImage !== image) {
    setShownImage(image);
    setState("loading");
  }

  return (
    <div className={cx(imgStyles.frame, className)}>
      {image && state !== "broken" && (
        <img
          src={image}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          onLoad={() => setState("loaded")}
          onError={() => setState("broken")}
          className={cx(imgStyles.photo, state === "loaded" ? imgStyles.shown : imgStyles.hidden)}
        />
      )}
    </div>
  );
}

const badgeStyles = {
  base: "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full text-caption leading-none font-semibold ring-1",
  regular: "min-h-6",
  compact: "min-h-5",
  top: "bg-yellow text-navy ring-white",
  new: "bg-navy text-white ring-white",
  count: "bg-navy text-white ring-white",
  outOfStock: "bg-white text-navy ring-navy/30",
  star: "size-3",
};

/** "Top rated", "New", "Out of stock", or (kind="count") a pill that shows its children. */
export function Badge({ kind, compact, children }: {
  kind: "top" | "new" | "outOfStock" | "count";
  compact?: boolean;
  children?: ReactNode;
}) {
  const t = useStrings(strings);
  const label = children ?? (kind === "top" ? t.badgeTop : kind === "new" ? t.badgeNew : t.outOfStock);
  const hasStar = kind === "top";
  const padding = compact ? (hasStar ? "ps-1 pe-2" : "px-2") : hasStar ? "ps-2 pe-3" : "px-3";

  return (
    <span className={cx(badgeStyles.base, compact ? badgeStyles.compact : badgeStyles.regular, padding, badgeStyles[kind])}>
      {hasStar && <Icon name="star" className={badgeStyles.star} />}
      {label}
    </span>
  );
}

const chipStyles = {
  base: "inline-flex max-w-full items-center rounded-full px-2 text-caption tabular-nums text-balance",
  regular: "min-h-6 py-1",
  compact: "min-h-5 py-0.5",
  outlined: "ring-1 ring-white",
  detail: "bg-mist font-medium",
  savings: "bg-arctic font-semibold",
};

/** A small rounded tag: "detail" for a chosen size/add-on, "savings" for "Save EGP 14". */
export function Chip({ kind = "detail", compact, outlined, children }: {
  kind?: "detail" | "savings";
  compact?: boolean;
  outlined?: boolean;
  children: ReactNode;
}) {
  return <span className={cx(chipStyles.base, compact ? chipStyles.compact : chipStyles.regular, outlined && chipStyles.outlined, chipStyles[kind])}>{children}</span>;
}

const chevronStyles = {
  base: "flex shrink-0 items-center justify-center rounded-full bg-yellow text-navy rtl:-scale-x-100",
  small: "size-6",
  compact: "size-7",
  regular: "size-8",
  iconSmall: "size-3",
  icon: "size-4",
};

/** The yellow circle with an arrow that says "this opens". It has no press handler: the card around it does. The arrow flips in RTL. */
export function Chevron({ small, compact }: { small?: boolean; compact?: boolean }) {
  return (
    <span aria-hidden="true" className={cx(chevronStyles.base, small ? chevronStyles.small : compact ? chevronStyles.compact : chevronStyles.regular)}>
      <Icon name="arrow" className={small ? chevronStyles.iconSmall : chevronStyles.icon} />
    </span>
  );
}

const headStyles = {
  root: "flex flex-col gap-1",
  title: "text-title font-bold text-balance",
  sub: "text-caption font-medium text-navy/65",
};

export function SectionHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className={headStyles.root}>
      <h2 className={headStyles.title}>{title}</h2>
      {sub && <p className={headStyles.sub}>{sub}</p>}
    </div>
  );
}

/** The big heading of a sheet. BottomSheet finds `data-sheet-title` and fades its top bar into this title while scrolling. */
export function SheetTitle({ children }: { children: ReactNode }) {
  return (
    <h2 data-sheet-title className="text-title font-bold text-balance">
      {children}
    </h2>
  );
}

// ==== Prices and animated numbers ====

const TEXT_SIZE = { caption: "text-caption", small: "text-small", body: "text-body", heading: "text-heading" };

const priceStyles = {
  normal: "font-bold",
  struck: "font-medium text-navy/65 line-through",
  withDiscount: "inline-flex flex-wrap items-baseline gap-x-1.5",
};

export function Price({ value, size = "small", struck, plus, rolling }: {
  value: number;
  size?: keyof typeof TEXT_SIZE;
  /** Crossed out: the price before a discount. */
  struck?: boolean;
  /** Writes "+25", for add-ons. */
  plus?: boolean;
  /** For a total that can change while on screen: its digits roll instead of jumping. */
  rolling?: boolean;
}) {
  const money = useMoney();
  const text = money(value, plus);
  const className = cx(TEXT_SIZE[size], struck ? priceStyles.struck : priceStyles.normal);
  // <bdi> isolates the price from the surrounding text direction, so "+25" and "EGP 90" never get reordered inside Arabic text.
  return rolling && !struck ? <Rolling text={text} className={className} /> : <bdi className={cx("tabular-nums", className)}>{text}</bdi>;
}

/** The current price, and next to it the old price crossed out when there is a discount. */
export function PriceWithDiscount({ value, regular, size = "small" }: {
  value: number;
  regular: number | null;
  size?: keyof typeof TEXT_SIZE;
}) {
  return (
    <span className={priceStyles.withDiscount}>
      <Price value={value} size={size} />
      {regular !== null && value < regular && <Price value={regular} size="caption" struck />}
    </span>
  );
}

const rollingStyles = {
  root: "relative inline-flex items-baseline tabular-nums",
  visual: "inline-flex items-baseline",
  plain: "whitespace-pre",
  numberGroup: "inline-flex",
  slot: "inline-block h-[1lh] overflow-clip",
  column: "flex flex-col transition-transform duration-300 ease-[var(--ease-smooth)]",
  digit: "block h-[1lh]",
};

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

// One column of the digits 0-9, slid up or down so that only digit `n` shows.
function DigitSlot({ n }: { n: number }) {
  return (
    <span className={rollingStyles.slot}>
      <span className={rollingStyles.column} style={{ transform: `translateY(${-n}lh)` }}>
        {DIGITS.map((digit) => (
          <span key={digit} className={rollingStyles.digit}>
            {digit}
          </span>
        ))}
      </span>
    </span>
  );
}

function NumberGroup({ text }: { text: string }) {
  const chars = [...text];
  let place = chars.filter((c) => /\d/.test(c)).length; // digits are keyed by their place (units, tens...) so a digit keeps its column
  return (
    <span dir="ltr" className={rollingStyles.numberGroup}>
      {chars.map((c, i) =>
        /\d/.test(c) ? <DigitSlot key={`d${--place}`} n={Number(c)} /> : <span key={`s${chars.length - i}`} className={rollingStyles.plain}>{c}</span>,
      )}
    </span>
  );
}

/** Text with numbers in it that changes while on screen: only the digits that changed slide. Screen readers get the plain text. */
export function Rolling({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={cx(rollingStyles.root, className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className={rollingStyles.visual}>
        {/* split() with a capture group puts the numbers at the odd positions of the result */}
        {text.split(/(\d[\d,.]*)/).map((part, i) =>
          i % 2 === 1 ? <NumberGroup key={i} text={part} /> : part !== "" && <span key={i} className={rollingStyles.plain}>{part}</span>,
        )}
      </span>
    </span>
  );
}

/** For an icon that gets replaced by another (plus → check): the new one pops in. Nothing plays on first render. */
export function Swap({ value, children, className = "" }: {
  value: string | number | boolean;
  children: ReactNode;
  className?: string;
}) {
  const key = String(value);
  const [previous, setPrevious] = useState(key);
  const [changed, setChanged] = useState(false);
  if (previous !== key) {
    setPrevious(key);
    setChanged(true);
  }
  return (
    <span key={key} className={cx("inline-flex", changed && "animate-pop-in", className)}>
      {children}
    </span>
  );
}

// ==== Buttons ====

const buttonStyles = {
  primary: "flex items-center justify-center rounded-full bg-yellow text-center font-bold text-navy transition-transform duration-150 ease-out data-pressed:scale-[0.98] data-disabled:opacity-50",
  primaryFull: "w-full",
  primaryAuto: "w-auto",
  primaryRegular: "h-14 px-4 text-heading",
  primaryCompact: "h-14 px-3 text-body xs:text-heading",
  primaryShort: "h-12",
  secondary: "flex h-12 items-center justify-center gap-2 rounded-full border border-arctic px-4 text-center text-small font-semibold data-hovered:bg-mist/60 data-pressed:bg-mist",
  close: "group flex size-12 items-center justify-center rounded-full",
  closeDisc: "flex items-center justify-center rounded-full bg-white transition group-data-pressed:scale-90",
  closeDiscSmall: "size-7 ring-1 ring-arctic",
  closeDiscLarge: "size-10",
  closeIconSmall: "size-3.5",
  closeIconLarge: "size-5",
};

export function PrimaryButton({ children, onPress, isDisabled, short, compact, width = "full", className = "" }: {
  children: ReactNode;
  onPress?: () => void;
  isDisabled?: boolean;
  /** 48px high instead of 56px. */
  short?: boolean;
  /** Sits in a row next to another control, so it has less side padding. */
  compact?: boolean;
  /** "full" fills its row. "auto" is only as wide as its text (also use it with flex-1). */
  width?: "full" | "auto";
  className?: string;
}) {
  return (
    <Button
      onPress={onPress}
      isDisabled={isDisabled}
      className={cx(
        buttonStyles.primary,
        width === "full" ? buttonStyles.primaryFull : buttonStyles.primaryAuto,
        compact ? buttonStyles.primaryCompact : buttonStyles.primaryRegular,
        short && buttonStyles.primaryShort,
        focusRing,
        className,
      )}
    >
      {children}
    </Button>
  );
}

export function SecondaryButton({ children, onPress, className = "", ref }: {
  children: ReactNode;
  onPress: () => void;
  className?: string;
  ref?: Ref<HTMLButtonElement>;
}) {
  return (
    <Button ref={ref} onPress={onPress} className={cx(buttonStyles.secondary, focusRing, className)}>
      {children}
    </Button>
  );
}

/** A 48px tap target around a round ×. `small` is a 28px outlined circle that reads on a photo and on white. */
export function CloseButton({ onPress, small }: { onPress: () => void; small?: boolean }) {
  const t = useStrings(strings);
  return (
    <Button aria-label={t.a11yClose} onPress={onPress} className={cx(buttonStyles.close, focusRing)}>
      <span className={cx(buttonStyles.closeDisc, small ? buttonStyles.closeDiscSmall : buttonStyles.closeDiscLarge)}>
        <Icon name="close" className={small ? buttonStyles.closeIconSmall : buttonStyles.closeIconLarge} />
      </span>
    </Button>
  );
}

// ==== Quantity ====

const stepperStyles = {
  root: "box-content flex shrink-0 items-center rounded-full border border-arctic",
  button: "flex items-center justify-center transition-transform duration-150 ease-out data-pressed:scale-90 data-disabled:opacity-40",
  count: "text-center text-body font-bold",
  // sm: inside the cart (36px high, still a 48px tap target). lg: in a sheet footer, level with the main button.
  sm: { box: "h-9", button: "relative h-9 w-11 after:absolute after:inset-x-0 after:-inset-y-1.5", count: "min-w-5", icon: "size-4" },
  lg: { box: "h-14", button: "h-14 w-10 xs:w-11", count: "min-w-5 xs:min-w-6", icon: "size-5" },
};

/** − 1 +. With `onRemove`, the minus becomes a bin at the minimum quantity. `title` names the control for screen readers. */
export function Stepper({ value, min, max, title, size, onChange, onRemove }: {
  value: number;
  min: number;
  max: number;
  title: string;
  size: "sm" | "lg";
  onChange: (next: number) => void;
  onRemove?: () => void;
}) {
  const t = useStrings(strings);
  const s = stepperStyles[size];
  const showBin = !!onRemove && value <= min;
  const button = cx(stepperStyles.button, s.button, focusRing);

  return (
    <div role="group" aria-label={title} className={cx(stepperStyles.root, s.box)}>
      <Button
        className={cx(button, "rounded-s-full")}
        isDisabled={!showBin && value <= min}
        aria-label={showBin ? t.a11yRemove(title) : t.a11yDecrease(title)}
        onPress={() => (showBin ? onRemove() : onChange(value - 1))}
      >
        <Swap value={showBin}>
          <Icon name={showBin ? "trash" : "minus"} className={s.icon} />
        </Swap>
      </Button>
      <span aria-live="polite" aria-atomic="true" className={cx(stepperStyles.count, s.count)}>
        <Rolling text={String(value)} />
      </span>
      <Button className={cx(button, "rounded-e-full")} isDisabled={value >= max} aria-label={t.a11yIncrease(title)} onPress={() => onChange(value + 1)}>
        <Icon name="plus" className={s.icon} />
      </Button>
    </div>
  );
}

const addBarStyles = {
  root: "flex items-center gap-2 xs:gap-3",
  button: "min-w-0 flex-1 gap-1.5 whitespace-nowrap",
};

/** The footer of the product and pairing sheets: quantity on one side, "Add to order · EGP 90" on the other. */
export function AddToCartBar({ title, qty, max, onQty, label, total, onSubmit }: {
  title: string;
  qty: number;
  max: number;
  onQty: (qty: number) => void;
  label: string;
  total: number;
  onSubmit: () => void;
}) {
  const money = useMoney();
  return (
    <div className={addBarStyles.root}>
      <Stepper size="lg" value={qty} min={1} max={max} title={title} onChange={onQty} />
      <PrimaryButton compact width="auto" onPress={onSubmit} className={addBarStyles.button}>
        <span>{label}</span>
        <span aria-hidden="true">·</span>
        <Rolling text={money(total)} />
      </PrimaryButton>
    </div>
  );
}

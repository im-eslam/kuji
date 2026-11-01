import { useState, type ReactNode, type Ref } from "react";
import { Button } from "react-aria-components";
import { useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import { strings, useMoney } from "../localization/strings";

// Small building blocks used by many menu components. Each one only receives props and draws something.
//
//   Img · Badge · Chip · Chevron · SectionHead
//   Price · PriceWithDiscount · Rolling · Swap
//   PrimaryButton · SecondaryButton · CloseButton · Stepper · AddToCartBar

// ==== Pictures, labels and headings ====

/** A product's own picture. With no picture (or a broken link) it shows a plain gradient placeholder. */
export function Img({ image, alt = "", className = "", priority }: {
  image: string | null;
  alt?: string;
  className?: string;
  /** Above the fold: load right away instead of waiting until it is near the screen. */
  priority?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [broken, setBroken] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-linear-to-br from-arctic to-mist ${className}`}>
      {image && !broken && (
        <img
          src={image}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => setBroken(true)}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-200 ease-out ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}

/** "Top rated", "New", "Out of stock", or (kind="count") a pill that shows its children. */
export function Badge({ kind, compact, children }: {
  kind: "top" | "new" | "outOfStock" | "count";
  compact?: boolean;
  children?: ReactNode;
}) {
  const t = useStrings(strings);
  const label = children ?? (kind === "top" ? t.badgeTop : kind === "new" ? t.badgeNew : t.outOfStock);
  const hasStar = kind === "top";
  const color = kind === "top" ? "bg-yellow text-navy" : kind === "outOfStock" ? "bg-white text-navy ring-navy/30" : "bg-navy text-white";
  const padding = compact ? (hasStar ? "ps-1 pe-2" : "px-2") : hasStar ? "ps-2 pe-3" : "px-3";

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full text-caption leading-none font-semibold ring-1 ring-white ${compact ? "min-h-5" : "min-h-6"} ${padding} ${color}`}
    >
      {hasStar && <Icon name="star" className="size-3" />}
      {label}
    </span>
  );
}

/** A small rounded tag: "detail" for a chosen size/add-on, "savings" for "Save EGP 14". */
export function Chip({ kind = "detail", compact, outlined, children }: {
  kind?: "detail" | "savings";
  compact?: boolean;
  outlined?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full px-2 text-caption tabular-nums text-balance ${outlined ? "ring-1 ring-white" : ""} ${compact ? "min-h-5 py-0.5" : "min-h-6 py-1"} ${
        kind === "detail" ? "bg-mist font-medium" : "bg-arctic font-semibold"
      }`}
    >
      {children}
    </span>
  );
}

/** The yellow circle with an arrow that says "this opens". It has no press handler: the card around it does. */
export function Chevron({ small, compact }: { small?: boolean; compact?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-yellow text-navy ${small ? "size-6" : compact ? "size-7" : "size-8"}`}
    >
      <Icon name="arrow" className={small ? "size-3" : "size-4"} />
    </span>
  );
}

export function SectionHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-1 px-4">
      <h2 className="text-title font-bold">{title}</h2>
      {sub && <p className="text-caption font-medium text-navy/65">{sub}</p>}
    </div>
  );
}

// ==== Prices and animated numbers ====

const TEXT_SIZE = { caption: "text-caption", small: "text-small", body: "text-body", heading: "text-heading" };

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
  const className = `${TEXT_SIZE[size]} ${struck ? "font-medium text-navy/65 line-through" : "font-bold"}`;
  return rolling && !struck ? <Rolling text={text} className={className} /> : <span className={className}>{text}</span>;
}

/** The current price, and next to it the old price crossed out when there is a discount. */
export function PriceWithDiscount({ value, regular, size = "small" }: {
  value: number;
  regular: number | null;
  size?: keyof typeof TEXT_SIZE;
}) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <Price value={value} size={size} />
      {regular !== null && value < regular && <Price value={regular} size="caption" struck />}
    </span>
  );
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

// One column of the digits 0-9, slid up or down so that only digit `n` shows.
function DigitSlot({ n }: { n: number }) {
  return (
    <span className="inline-block h-[1lh] overflow-clip">
      <span className="flex flex-col transition-transform duration-300 ease-[var(--ease-smooth)]" style={{ transform: `translateY(${-n}lh)` }}>
        {DIGITS.map((digit) => (
          <span key={digit} className="block h-[1lh]">
            {digit}
          </span>
        ))}
      </span>
    </span>
  );
}

/** Text with numbers in it that changes while on screen: only the digits that changed slide. */
export function Rolling({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`relative inline-flex items-baseline tabular-nums ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-flex items-baseline">
        {/* split() with a capture group puts the numbers at the odd positions of the result */}
        {text.split(/(\d[\d,.]*)/).map((part, i) =>
          i % 2 === 1 ? <NumberGroup key={i} text={part} /> : part !== "" && <span key={i} className="whitespace-pre">{part}</span>,
        )}
      </span>
    </span>
  );
}

function NumberGroup({ text }: { text: string }) {
  const chars = [...text];
  let place = chars.filter((c) => /\d/.test(c)).length; // digits are keyed by their place (units, tens...) so a digit keeps its column
  return (
    <span dir="ltr" className="inline-flex">
      {chars.map((c, i) =>
        /\d/.test(c) ? <DigitSlot key={`d${--place}`} n={Number(c)} /> : <span key={`s${chars.length - i}`} className="whitespace-pre">{c}</span>,
      )}
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
    <span key={key} className={`inline-flex ${changed ? "animate-pop-in" : ""} ${className}`}>
      {children}
    </span>
  );
}

// ==== Buttons ====

export function PrimaryButton({ children, onPress, short, compact, className = "" }: {
  children: ReactNode;
  onPress: () => void;
  short?: boolean;
  /** Sits in a row next to another control, so it has less side padding. */
  compact?: boolean;
  className?: string;
}) {
  return (
    <Button
      onPress={onPress}
      className={`flex w-full items-center justify-center rounded-full bg-yellow text-center font-bold text-navy transition-transform duration-150 ease-out data-pressed:scale-[0.98] ${
        compact ? "px-3 text-body xs:text-heading" : "px-4 text-heading"
      } ${short ? "h-12" : "h-14"} ${className}`}
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
    <Button
      ref={ref}
      onPress={onPress}
      className={`flex h-12 items-center justify-center gap-2 rounded-full border border-arctic px-4 text-center text-small font-semibold data-pressed:bg-mist ${className}`}
    >
      {children}
    </Button>
  );
}

/** A 48px tap target around a round ×. `small` is a 28px outlined circle that reads on a photo and on white. */
export function CloseButton({ onPress, small }: { onPress: () => void; small?: boolean }) {
  const t = useStrings(strings);
  return (
    <Button aria-label={t.a11yClose} onPress={onPress} className="group flex size-12 items-center justify-center">
      <span className={`flex items-center justify-center rounded-full bg-white transition group-data-pressed:scale-90 ${small ? "size-7 ring-1 ring-arctic" : "size-10"}`}>
        <Icon name="close" className={small ? "size-3.5" : "size-5"} />
      </span>
    </Button>
  );
}

// ==== Quantity ====

const STEPPER_SIZE = {
  // sm: inside the cart (36px high, still a 48px tap target). lg: in a sheet footer, level with the main button.
  sm: { box: "h-9", button: "relative h-9 w-10 after:absolute after:inset-x-0 after:-inset-y-1.5", count: "min-w-5", icon: "size-4" },
  lg: { box: "h-14", button: "h-14 w-10 xs:w-11", count: "min-w-5 xs:min-w-6", icon: "size-5" },
};

/** − 1 +. With `onRemove`, the minus becomes a bin at the minimum quantity. `title` names the control for screen readers. */
export function Stepper({ value, min, max, title, size, onChange, onRemove }: {
  value: number;
  min: number;
  max: number;
  title: string;
  size: keyof typeof STEPPER_SIZE;
  onChange: (next: number) => void;
  onRemove?: () => void;
}) {
  const t = useStrings(strings);
  const s = STEPPER_SIZE[size];
  const showBin = !!onRemove && value <= min;
  const button = `flex items-center justify-center transition-transform duration-150 ease-out data-pressed:scale-90 data-disabled:opacity-40 ${s.button}`;

  return (
    <div role="group" aria-label={title} className={`box-content flex shrink-0 items-center rounded-full border border-arctic ${s.box}`}>
      <Button
        className={`${button} rounded-s-full`}
        isDisabled={!showBin && value <= min}
        aria-label={showBin ? t.a11yRemove(title) : t.a11yDecrease(title)}
        onPress={() => (showBin ? onRemove() : onChange(value - 1))}
      >
        <Swap value={showBin}>
          <Icon name={showBin ? "trash" : "minus"} className={s.icon} />
        </Swap>
      </Button>
      <span aria-live="polite" aria-atomic="true" className={`text-center text-body font-bold ${s.count}`}>
        <Rolling text={String(value)} />
      </span>
      <Button className={`${button} rounded-e-full`} isDisabled={value >= max} aria-label={t.a11yIncrease(title)} onPress={() => onChange(value + 1)}>
        <Icon name="plus" className={s.icon} />
      </Button>
    </div>
  );
}

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
    <div className="flex items-center gap-2 xs:gap-3">
      <Stepper size="lg" value={qty} min={1} max={max} title={title} onChange={onQty} />
      <PrimaryButton compact onPress={onSubmit} className="min-w-0 flex-1 gap-1.5 whitespace-nowrap">
        <span>{label}</span>
        <span aria-hidden="true">·</span>
        <Rolling text={money(total)} />
      </PrimaryButton>
    </div>
  );
}

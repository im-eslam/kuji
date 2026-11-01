/* eslint-disable react-refresh/only-export-components -- Shared utilities stay in this module. */
import { useState, type ReactNode, type Ref } from "react";
import { Button } from "react-aria-components";
import { useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import { strings, useMoney } from "../../localization/strings";

// ==== Shared class names ====

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export const focusRing =
  "outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-navy";

export const focusRingInset =
  "outline-none data-focus-visible:outline-2 data-focus-visible:-outline-offset-2 data-focus-visible:outline-navy";

export const pageWidth = "mx-auto w-full max-w-5xl";

export const pagePadding = "px-4 md:px-6";

export const cardSurface = cx(
  "rounded-lg border border-arctic bg-white text-start transition-[transform,background-color,border-color] duration-150 ease-out",
  "data-hovered:border-navy/30 data-pressed:scale-[0.98] data-pressed:bg-mist",
  focusRing,
);

// ==== Pictures, labels and headings ====

const imgStyles = {
  frame: "relative overflow-hidden bg-mist",
  photo:
    "absolute inset-0 size-full object-cover transition-opacity duration-200 ease-out",
  shown: "opacity-100",
  hidden: "opacity-0",
};

export function Img({
  image,
  alt = "",
  className = "",
  priority,
}: {
  image: string | null;
  alt?: string;
  className?: string;
  priority?: boolean;
}) {
  const [state, setState] = useState<"loading" | "loaded" | "broken">(
    "loading",
  );
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
          className={cx(
            imgStyles.photo,
            state === "loaded" ? imgStyles.shown : imgStyles.hidden,
          )}
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

export function Badge({
  kind,
  compact,
  children,
}: {
  kind: "top" | "new" | "outOfStock" | "count";
  compact?: boolean;
  children?: ReactNode;
}) {
  const t = useStrings(strings);
  const label =
    children ??
    (kind === "top" ? t.badgeTop : kind === "new" ? t.badgeNew : t.outOfStock);
  const hasStar = kind === "top";
  const padding = compact
    ? hasStar
      ? "ps-1 pe-2"
      : "px-2"
    : hasStar
      ? "ps-2 pe-3"
      : "px-3";

  return (
    <span
      className={cx(
        badgeStyles.base,
        compact ? badgeStyles.compact : badgeStyles.regular,
        padding,
        badgeStyles[kind],
      )}
    >
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

export function Chip({
  kind = "detail",
  compact,
  outlined,
  children,
}: {
  kind?: "detail" | "savings";
  compact?: boolean;
  outlined?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={cx(
        chipStyles.base,
        compact ? chipStyles.compact : chipStyles.regular,
        outlined && chipStyles.outlined,
        chipStyles[kind],
      )}
    >
      {children}
    </span>
  );
}

const chevronStyles = {
  base: "flex shrink-0 items-center justify-center rounded-full bg-yellow text-navy",
  small: "size-6",
  compact: "size-7",
  regular: "size-8",
  iconSmall: "size-3",
  icon: "size-4",
};

export function Chevron({
  small,
  compact,
}: {
  small?: boolean;
  compact?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        chevronStyles.base,
        small
          ? chevronStyles.small
          : compact
            ? chevronStyles.compact
            : chevronStyles.regular,
      )}
    >
      <Icon
        name="arrow"
        className={small ? chevronStyles.iconSmall : chevronStyles.icon}
      />
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

export function SheetTitle({ children }: { children: ReactNode }) {
  return (
    <h2 data-sheet-title className="text-title font-bold text-balance">
      {children}
    </h2>
  );
}

// ==== Prices and animated numbers ====

const TEXT_SIZE = {
  caption: "text-caption",
  small: "text-small",
  body: "text-body",
  heading: "text-heading",
};

const priceStyles = {
  normal: "font-bold",
  struck: "font-medium text-navy/65 line-through",
  withDiscount: "inline-flex flex-wrap items-baseline gap-x-1.5",
};

export function Price({
  value,
  size = "small",
  struck,
  plus,
  rolling,
  showCurrency = true,
}: {
  value: number;
  size?: keyof typeof TEXT_SIZE;
  struck?: boolean;
  plus?: boolean;
  rolling?: boolean;
  showCurrency?: boolean;
}) {
  const money = useMoney();
  const text = showCurrency
    ? money(value, plus)
    : `${plus ? "+" : ""}${Math.round(value)}`;
  const className = cx(
    TEXT_SIZE[size],
    struck ? priceStyles.struck : priceStyles.normal,
  );
  return rolling && !struck ? (
    <Rolling text={text} className={className} />
  ) : (
    <bdi className={cx("tabular-nums", className)}>{text}</bdi>
  );
}

export function PriceWithDiscount({
  value,
  regular,
  size = "small",
}: {
  value: number;
  regular: number | null;
  size?: keyof typeof TEXT_SIZE;
}) {
  return (
    <span className={priceStyles.withDiscount}>
      <Price value={value} size={size} />
      {regular !== null && value < regular && (
        <Price value={regular} size="caption" struck showCurrency={false} />
      )}
    </span>
  );
}

const rollingStyles = {
  root: "relative inline-flex items-baseline tabular-nums",
  visual: "inline-flex items-baseline",
  plain: "whitespace-pre",
  numberGroup: "inline-flex",
  slot: "inline-block h-[1lh] overflow-clip",
  column:
    "flex flex-col transition-transform duration-300 ease-[var(--ease-smooth)]",
  digit: "block h-[1lh]",
};

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function DigitSlot({ n }: { n: number }) {
  return (
    <span className={rollingStyles.slot}>
      <span
        className={rollingStyles.column}
        style={{ transform: `translateY(${-n}lh)` }}
      >
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
  let place = chars.filter((c) => /\d/.test(c)).length;
  return (
    <span dir="ltr" className={rollingStyles.numberGroup}>
      {chars.map((c, i) =>
        /\d/.test(c) ? (
          <DigitSlot key={`d${--place}`} n={Number(c)} />
        ) : (
          <span key={`s${chars.length - i}`} className={rollingStyles.plain}>
            {c}
          </span>
        ),
      )}
    </span>
  );
}

export function Rolling({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  return (
    <span className={cx(rollingStyles.root, className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className={rollingStyles.visual}>
        {text.split(/(\d[\d,.]*)/).map((part, i) =>
          i % 2 === 1 ? (
            <NumberGroup key={i} text={part} />
          ) : (
            part !== "" && (
              <span key={i} className={rollingStyles.plain}>
                {part}
              </span>
            )
          ),
        )}
      </span>
    </span>
  );
}

export function Swap({
  value,
  children,
  className = "",
}: {
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
    <span
      key={key}
      className={cx("inline-flex", changed && "animate-pop-in", className)}
    >
      {children}
    </span>
  );
}

// ==== Buttons ====

const buttonStyles = {
  primary:
    "flex items-center justify-center rounded-full bg-yellow text-center font-bold text-navy transition-transform duration-150 ease-out data-pressed:scale-[0.98] data-disabled:opacity-50",
  primaryFull: "w-full",
  primaryAuto: "w-auto",
  primaryRegular: "h-14 px-4 text-heading",
  primaryCompact: "h-14 px-3 text-body xs:text-heading",
  primaryShort: "h-12",
  secondary:
    "flex h-12 items-center justify-center gap-2 rounded-full border border-arctic px-4 text-center text-small font-semibold data-hovered:bg-mist/60 data-pressed:bg-mist",
  close: "group flex size-12 items-center justify-center rounded-full",
  closeDisc:
    "flex items-center justify-center rounded-full bg-white transition group-data-pressed:scale-90",
  closeDiscSmall: "size-7 ring-1 ring-arctic",
  closeDiscLarge: "size-10",
  closeIconSmall: "size-3.5",
  closeIconLarge: "size-5",
};

export function PrimaryButton({
  children,
  onPress,
  isDisabled,
  short,
  compact,
  width = "full",
  className = "",
}: {
  children: ReactNode;
  onPress?: () => void;
  isDisabled?: boolean;
  short?: boolean;
  compact?: boolean;
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

export function SecondaryButton({
  children,
  onPress,
  className = "",
  ref,
}: {
  children: ReactNode;
  onPress: () => void;
  className?: string;
  ref?: Ref<HTMLButtonElement>;
}) {
  return (
    <Button
      ref={ref}
      onPress={onPress}
      className={cx(buttonStyles.secondary, focusRing, className)}
    >
      {children}
    </Button>
  );
}

export function CloseButton({
  onPress,
  small,
}: {
  onPress: () => void;
  small?: boolean;
}) {
  const t = useStrings(strings);
  return (
    <Button
      aria-label={t.a11yClose}
      onPress={onPress}
      className={cx(buttonStyles.close, focusRing)}
    >
      <span
        className={cx(
          buttonStyles.closeDisc,
          small ? buttonStyles.closeDiscSmall : buttonStyles.closeDiscLarge,
        )}
      >
        <Icon
          name="close"
          className={
            small ? buttonStyles.closeIconSmall : buttonStyles.closeIconLarge
          }
        />
      </span>
    </Button>
  );
}

// ==== Quantity ====

const stepperStyles = {
  root: "box-content flex shrink-0 items-center rounded-full border border-arctic",
  button:
    "flex items-center justify-center transition-transform duration-150 ease-out data-pressed:scale-90 data-disabled:opacity-40",
  count: "text-center text-body font-bold",
  sm: {
    box: "h-9",
    button:
      "relative h-9 w-11 after:absolute after:inset-x-0 after:-inset-y-1.5",
    count: "min-w-5",
    icon: "size-4",
  },
  lg: {
    box: "h-14",
    button: "h-14 w-10 xs:w-11",
    count: "min-w-5 xs:min-w-6",
    icon: "size-5",
  },
};

export function Stepper({
  value,
  min,
  max,
  title,
  size,
  onChange,
  onRemove,
}: {
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
    <div
      role="group"
      aria-label={title}
      className={cx(stepperStyles.root, s.box)}
    >
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
      <span
        aria-live="polite"
        aria-atomic="true"
        className={cx(stepperStyles.count, s.count)}
      >
        <Rolling text={String(value)} />
      </span>
      <Button
        className={cx(button, "rounded-e-full")}
        isDisabled={value >= max}
        aria-label={t.a11yIncrease(title)}
        onPress={() => onChange(value + 1)}
      >
        <Icon name="plus" className={s.icon} />
      </Button>
    </div>
  );
}

const addBarStyles = {
  root: "flex items-center gap-2 xs:gap-3",
  button: "min-w-0 flex-1 gap-1.5 whitespace-nowrap",
};

export function AddToCartBar({
  title,
  qty,
  max,
  onQty,
  label,
  total,
  onSubmit,
}: {
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
      <Stepper
        size="lg"
        value={qty}
        min={1}
        max={max}
        title={title}
        onChange={onQty}
      />
      <PrimaryButton
        compact
        width="auto"
        onPress={onSubmit}
        className={addBarStyles.button}
      >
        <span>{label}</span>
        <span aria-hidden="true">·</span>
        <Rolling text={money(total)} />
      </PrimaryButton>
    </div>
  );
}

import type { ReactNode } from "react";
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components";
import { Icon, type IconName } from "@/shared/icons";
import { cx, focusRing, focusRingOnDark } from "./classes";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "quiet" | "icon";

interface ButtonProps extends Omit<AriaButtonProps, "className" | "children"> {
  variant?: Variant;
  // Replaced by a spinner of the same size while pending, so the width holds.
  icon?: IconName;
  className?: string;
  children?: ReactNode;
}

const styles = {
  base: "text-small inline-flex items-center justify-center gap-2 rounded-full font-bold whitespace-nowrap transition motion-reduce:transition-none data-pressed:scale-[0.98] motion-reduce:data-pressed:scale-100 data-disabled:opacity-40 data-pending:cursor-progress",
  primary: cx(
    "min-h-12 bg-navy px-6 text-white data-hovered:bg-navy/90",
    focusRingOnDark,
  ),
  secondary: cx(
    "min-h-12 border border-navy/15 bg-white px-6 data-hovered:bg-mist",
    focusRing,
  ),
  quiet: cx("min-h-12 px-4 data-hovered:bg-white/80", focusRing),
  icon: cx("size-12 data-hovered:bg-white", focusRing),
};

export function Button({
  variant = "primary",
  icon,
  className,
  children,
  ...props
}: ButtonProps) {
  const iconSize = variant === "icon" ? "size-6" : "size-5";

  return (
    <AriaButton
      {...props}
      className={cx(styles.base, styles[variant], className)}
    >
      {({ isPending }) => (
        <>
          {isPending ? (
            <Spinner className={iconSize} />
          ) : (
            icon && <Icon name={icon} className={iconSize} />
          )}
          {children}
        </>
      )}
    </AriaButton>
  );
}

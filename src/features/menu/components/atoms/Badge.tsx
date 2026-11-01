import type { ReactNode } from "react";
import { Icon } from "@/shared/icons";
import { useStrings } from "@/shared/i18n";
import { strings } from "../../strings";
import type { BadgeKind } from "../../types";

interface Props {
  kind: BadgeKind | "count" | "outOfStock";
  compact?: boolean;
  children?: ReactNode;
}

const styles = {
  base: "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full text-caption leading-none font-semibold ring-1 ring-white",
  icon: "size-3",
};

// Height is a minimum and the line is tight, so a larger user font size grows the pill instead of clipping it.
export function Badge({ kind, compact, children }: Props) {
  const t = useStrings(strings);
  const label = children ?? (kind === "top" ? t.badgeTop : kind === "new" ? t.badgeNew : kind === "outOfStock" ? t.outOfStock : "");
  const icon = kind === "top";
  return (
    <span
      className={`${styles.base} ${compact ? "min-h-5" : "min-h-6"} ${compact ? (icon ? "ps-1 pe-2" : "px-2") : icon ? "ps-2 pe-3" : "px-3"} ${
        kind === "top" ? "bg-yellow text-navy" : kind === "outOfStock" ? "bg-white text-navy ring-navy/30" : "bg-navy text-white"
      }`}
    >
      {icon && <Icon name="star" className={styles.icon} />}
      {label}
    </span>
  );
}

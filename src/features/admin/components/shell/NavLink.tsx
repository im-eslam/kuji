import { Link } from "react-aria-components";
import { Icon, type IconName } from "@/shared/icons";
import { cx, focusRing, focusRingOnDark } from "../ui/classes";

interface NavLinkProps {
  href: string;
  icon: IconName;
  label: string;
  isCurrent: boolean;
  // "sidebar": full-width row on desktop. "pill": compact chip in the mobile rail.
  variant: "sidebar" | "pill";
}

const styles = {
  row: "text-small flex min-h-12 items-center gap-3 rounded-lg px-4 font-bold transition motion-reduce:transition-none",
  pillLink: "group flex h-12 shrink-0 items-center rounded-full",
  pillBody:
    "text-small flex h-10 items-center gap-2 rounded-full px-4 font-bold whitespace-nowrap transition motion-reduce:transition-none",
  current: "bg-navy text-white",
  idleRow: "text-navy/75 data-hovered:bg-white",
  idlePill: "text-navy/75 group-data-hovered:bg-white",
  icon: "size-5 shrink-0",
  iconCurrent: "text-yellow",
};

export function NavLink({
  href,
  icon,
  label,
  isCurrent,
  variant,
}: NavLinkProps) {
  // The router does not mark the current page for us.
  const ariaCurrent = isCurrent ? "page" : undefined;
  const iconClass = cx(styles.icon, isCurrent && styles.iconCurrent);

  if (variant === "pill") {
    return (
      <Link
        href={href}
        aria-current={ariaCurrent}
        className={cx(styles.pillLink, focusRing)}
      >
        <span
          className={cx(
            styles.pillBody,
            isCurrent ? styles.current : styles.idlePill,
          )}
        >
          <Icon name={icon} className={iconClass} />
          {label}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      aria-current={ariaCurrent}
      className={cx(
        styles.row,
        isCurrent ? styles.current : styles.idleRow,
        isCurrent ? focusRingOnDark : focusRing,
      )}
    >
      <Icon name={icon} className={iconClass} />
      {label}
    </Link>
  );
}

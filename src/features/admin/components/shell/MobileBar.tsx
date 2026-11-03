import { useEffect, useRef, useState } from "react";
import avatar from "@/assets/avatar.jpg";
import wordmark from "@/assets/wordmark.png";
import { useStrings } from "@/shared/i18n";
import { usePath } from "@/shared/router";
import { TABS } from "../../config";
import { signOut } from "../../data/session";
import { strings } from "../../localization/strings";
import { Button } from "../ui/Button";
import { NavLink } from "./NavLink";

const styles = {
  bar: "sticky top-0 z-30 border-b border-white/70 bg-white/80 pt-[env(safe-area-inset-top)] backdrop-blur-md lg:hidden",
  topRow: "flex h-14 items-center gap-2 ps-4 pe-2",
  avatar: "size-9 shrink-0 rounded-full object-cover ring-2 ring-navy",
  wordmark: "h-7 w-auto",
  spacer: "flex-1",
  nav: "h-12",
  rail: "no-scrollbar flex h-12 items-center gap-2 overflow-x-auto px-4",
};

export function MobileBar() {
  const s = useStrings(strings);
  const path = usePath();
  const rail = useRef<HTMLDivElement>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Keep the current pill visible when the rail scrolls (or after a deep link).
  useEffect(() => {
    const current = rail.current?.querySelector("[aria-current='page']");
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    current?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [path]);

  function handleSignOut() {
    setIsSigningOut(true);
    void signOut();
  }

  return (
    <header className={styles.bar}>
      <div className={styles.topRow}>
        <img
          src={avatar}
          alt=""
          width={240}
          height={240}
          className={styles.avatar}
        />
        <img
          src={wordmark}
          alt={s.brandName}
          width={190}
          height={112}
          className={styles.wordmark}
        />
        <div className={styles.spacer} />
        <Button
          variant="icon"
          icon="logout"
          aria-label={isSigningOut ? s.loggingOut : s.logout}
          isPending={isSigningOut}
          onPress={handleSignOut}
        />
      </div>

      <nav aria-label={s.navLabel} className={styles.nav}>
        <div ref={rail} className={styles.rail}>
          {TABS.map((tab) => (
            <NavLink
              key={tab.id}
              href={tab.path}
              icon={tab.icon}
              label={s.tabs[tab.id]}
              isCurrent={path === tab.path}
              variant="pill"
            />
          ))}
        </div>
      </nav>
    </header>
  );
}

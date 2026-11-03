import { useState } from "react";
import avatar from "@/assets/avatar.jpg";
import wordmark from "@/assets/wordmark.png";
import { useStrings } from "@/shared/i18n";
import { usePath } from "@/shared/router";
import { TABS } from "../../config";
import { signOut, useSession } from "../../data/session";
import { strings } from "../../localization/strings";
import { Button } from "../ui/Button";
import { NavLink } from "./NavLink";

const styles = {
  sidebar:
    "sticky top-4 m-4 hidden h-[calc(100dvh-2rem)] w-64 shrink-0 flex-col gap-6 self-start rounded-sheet border border-white/70 bg-white/80 p-4 lg:flex",
  brand: "flex flex-col items-center gap-3 pt-2",
  avatar: "size-16 rounded-full object-cover ring-2 ring-navy",
  wordmark: "h-8 w-auto",
  badge: "text-caption rounded-full bg-navy px-3 py-1 font-bold text-yellow",
  nav: "flex flex-col gap-1",
  footer: "mt-auto flex flex-col gap-3",
  signedInAs: "text-caption truncate px-1 text-navy/65",
};

export function Sidebar() {
  const s = useStrings(strings);
  const path = usePath();
  const session = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const username = session.status === "signedIn" ? session.user.username : "";

  function handleSignOut() {
    setIsSigningOut(true);
    void signOut();
  }

  return (
    <div className={styles.sidebar}>
      <div className={styles.brand}>
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
        <span className={styles.badge}>{s.adminBadge}</span>
      </div>

      <nav aria-label={s.navLabel} className={styles.nav}>
        {TABS.map((tab) => (
          <NavLink
            key={tab.id}
            href={tab.path}
            icon={tab.icon}
            label={s.tabs[tab.id]}
            isCurrent={path === tab.path}
            variant="sidebar"
          />
        ))}
      </nav>

      <div className={styles.footer}>
        <p className={styles.signedInAs}>
          {s.signedInAs.replace("{name}", username)}
        </p>
        <Button
          variant="secondary"
          icon="logout"
          isPending={isSigningOut}
          onPress={handleSignOut}
          className="w-full"
        >
          {isSigningOut ? s.loggingOut : s.logout}
        </Button>
      </div>
    </div>
  );
}
